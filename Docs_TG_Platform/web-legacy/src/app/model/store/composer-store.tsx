"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { getGlobalReply, getPostReply } from "@/shared/lib/replies";
import { routes } from "@/shared/lib/routes";
import { truncate } from "@/shared/lib/helpers";
import { domainActions } from "@/app/model/store/domain/actionCreators";
import { useDomainActions, useDomainSelector } from "@/app/model/store/domain-store";
import { useUi } from "@/app/model/store/ui-store";
import {
  buildAiReplyMessage,
  buildComposerTargetPatch,
  buildComposerWebPatch,
  hasLlmForComposerScope,
  resolveLlmLabel,
  resolveMultiResponsePairs,
  resolveWebLabel,
} from "@/app/model/store/composer/helpers";
import type { NavigationPatch } from "@/app/model/store/navigation/types";
import type { ComposerScope, GlobalChat, LocalChat, ScreenId } from "@/shared/types";

export type ComposerNavBridge = {
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  canLeaveCurrentScreen: (next: ScreenId) => boolean;
  getCurrentGChatId: () => string | null;
  getCurrentPostId: () => number | null;
  getCurrentPostChatId: () => number | null;
  applyNavPatch: (patch: NavigationPatch) => void;
};

export type ComposerContextValue = {
  sendHome: (text: string) => boolean;
  sendGChat: (text: string) => boolean;
  sendPost: (text: string) => boolean;
  hasLlmForSend: (scope: ComposerScope) => boolean;
  setComposerLlm: (scope: ComposerScope, llmId: string) => void;
  setComposerWeb: (scope: ComposerScope, webId: string) => void;
  multiResponsePairs: () => { id: string; llmId: string; webId: string; label: string }[];
  llmLabel: (id: string) => string;
  webLabel: (id: string) => string;
  registerNavBridge: (bridge: ComposerNavBridge) => () => void;
};

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const domain = useDomainSelector((s) => s);
  const { dispatch, applyPatch } = useDomainActions();
  const { setMobileSidebarOpen } = useUi();
  const domainRef = useRef(domain);
  domainRef.current = domain;
  const navBridgeRef = useRef<ComposerNavBridge | null>(null);

  const registerNavBridge = useCallback((bridge: ComposerNavBridge) => {
    navBridgeRef.current = bridge;
    return () => {
      if (navBridgeRef.current === bridge) navBridgeRef.current = null;
    };
  }, []);

  const llmLabel = useCallback((id: string) => resolveLlmLabel(domainRef.current, id), []);
  const webLabel = useCallback((id: string) => resolveWebLabel(domainRef.current, id), []);

  const multiResponsePairs = useCallback(
    () => resolveMultiResponsePairs(domainRef.current),
    [],
  );

  const hasLlmForSend = useCallback(
    (scope: ComposerScope) => hasLlmForComposerScope(domainRef.current, scope),
    [],
  );

  const setComposerLlm = useCallback(
    (scope: ComposerScope, llmId: string) => {
      applyPatch(buildComposerTargetPatch(domainRef.current, scope, llmId));
    },
    [applyPatch],
  );

  const setComposerWeb = useCallback(
    (scope: ComposerScope, webId: string) => {
      applyPatch(buildComposerWebPatch(domainRef.current, scope, webId));
    },
    [applyPatch],
  );

  const assertLlm = useCallback((scope: ComposerScope) => {
    if (hasLlmForComposerScope(domainRef.current, scope)) return true;
    if (typeof window !== "undefined") window.alert("Активируйте LLM модель.");
    return false;
  }, []);

  const sendHome = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      if (!text.trim() || !bridge) return false;
      if (!assertLlm("home")) return false;
      if (!bridge.canLeaveCurrentScreen("gchat")) return false;
      setMobileSidebarOpen(false);
      const id = "gc" + Date.now();
      const newChat: GlobalChat = {
        id,
        title: truncate(text, 40),
        preview: text,
        date: "сейчас",
        history: [{ role: "user", text }],
      };
      dispatch(domainActions.addGlobalChat(newChat));
      bridge.goToHref(routes.gchat(id));
      setTimeout(() => {
        const reply = buildAiReplyMessage(domainRef.current, getGlobalReply(text), "home");
        dispatch(domainActions.pushGlobalChat(id, reply));
      }, 900);
      return true;
    },
    [assertLlm, dispatch, setMobileSidebarOpen],
  );

  const sendGChat = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      const chatId = bridge?.getCurrentGChatId();
      if (!text.trim() || !chatId) return false;
      if (!assertLlm("gchat")) return false;
      dispatch(domainActions.pushGlobalChat(chatId, { role: "user", text }));
      setTimeout(() => {
        const reply = buildAiReplyMessage(domainRef.current, getGlobalReply(text), "gchat");
        dispatch(domainActions.pushGlobalChat(chatId, reply));
      }, 900);
      return true;
    },
    [assertLlm, dispatch],
  );

  const sendPost = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      if (!bridge) return false;
      const postId = bridge.getCurrentPostId();
      if (!text.trim() || postId == null) return false;
      if (!assertLlm("post")) return false;
      let chatId = bridge.getCurrentPostChatId();
      if (chatId == null) {
        chatId = Date.now();
        const newChat: LocalChat = {
          id: chatId,
          title: truncate(text, 40),
          preview: text,
          date: "сейчас",
          ai: true,
          history: [{ role: "user", text }],
        };
        dispatch(domainActions.addLocalChat(postId, newChat));
        bridge.applyNavPatch({ currentPostChatId: chatId });
      } else {
        dispatch(domainActions.pushLocalChatMsg(postId, chatId, { role: "user", text }));
      }
      const replyChatId = chatId;
      setTimeout(() => {
        const reply = buildAiReplyMessage(domainRef.current, getPostReply(text), "post");
        dispatch(domainActions.pushLocalChatMsg(postId, replyChatId, reply));
      }, 800);
      return true;
    },
    [assertLlm, dispatch],
  );

  const value = useMemo<ComposerContextValue>(
    () => ({
      sendHome,
      sendGChat,
      sendPost,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      multiResponsePairs,
      llmLabel,
      webLabel,
      registerNavBridge,
    }),
    [
      sendHome,
      sendGChat,
      sendPost,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      multiResponsePairs,
      llmLabel,
      webLabel,
      registerNavBridge,
    ],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("useComposer must be used inside <ComposerProvider>");
  return ctx;
}
