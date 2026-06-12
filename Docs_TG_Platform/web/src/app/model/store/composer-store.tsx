"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useUiStore } from "@/app/model/store/ui-store";
import { useComposerTargetStore } from "@/app/model/store/composer-target-store";
import {
  buildAiReplyMessage,
  hasLlmForComposerScope,
  resolveLlmLabel,
  resolveWebLabel,
} from "@/app/model/store/composer/helpers";
import { selectAiProfileConfig, useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import { useCreateGlobalChat, usePushGlobalChatMessage } from "@/entities/chat";
import { useAddLocalChat, usePushLocalChatMessage } from "@/entities/post";
import { getGlobalReply, getPostReply } from "@/shared/lib/replies";
import { routes } from "@/shared/lib/routes";
import { truncate } from "@/shared/lib/helpers";
import { buildMultiResponsePairs } from "@/shared/config/composer";
import type { ComposerScope, GlobalChat, LocalChat } from "@/shared/types";

export type ComposerNavBridge = {
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  getCurrentGChatId: () => string | null;
  getCurrentPostId: () => number | null;
  getCurrentPostChatId: () => number | null;
  setCurrentPostChatId: (chatId: number) => void;
};

export type ComposerContextValue = {
  sendHome: (text: string) => boolean;
  sendGChat: (text: string) => boolean;
  sendPost: (text: string) => boolean;
  hasLlmForSend: (scope: ComposerScope) => boolean;
  setComposerLlm: (scope: ComposerScope, llmId: string) => void;
  setComposerWeb: (scope: ComposerScope, webId: string) => void;
  registerNavBridge: (bridge: ComposerNavBridge) => () => void;
};

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const aiProfile = useProfileDraftStore(selectAiProfileConfig);
  const createChat = useCreateGlobalChat();
  const pushMessage = usePushGlobalChatMessage();
  const addLocalChat = useAddLocalChat();
  const pushLocalChatMessage = usePushLocalChatMessage();
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const setLlmId = useComposerTargetStore((s) => s.setLlmId);
  const setWebId = useComposerTargetStore((s) => s.setWebId);
  const getTarget = useComposerTargetStore((s) => s.getTarget);

  const navBridgeRef = useRef<ComposerNavBridge | null>(null);
  const aiProfileRef = useRef(aiProfile);
  aiProfileRef.current = aiProfile;

  const registerNavBridge = useCallback((bridge: ComposerNavBridge) => {
    navBridgeRef.current = bridge;
    return () => {
      if (navBridgeRef.current === bridge) navBridgeRef.current = null;
    };
  }, []);

  const assertLlm = useCallback((scope: ComposerScope) => {
    const cfg = aiProfileRef.current;
    if (!cfg) return false;
    const target = getTarget(scope);
    if (hasLlmForComposerScope(cfg, scope, target.llmId)) return true;
    if (typeof window !== "undefined") window.alert("Активируйте LLM модель.");
    return false;
  }, [getTarget]);

  const setComposerLlm = useCallback(
    (scope: ComposerScope, llmId: string) => setLlmId(scope, llmId),
    [setLlmId],
  );

  const setComposerWeb = useCallback(
    (scope: ComposerScope, webId: string) => setWebId(scope, webId),
    [setWebId],
  );

  const hasLlmForSend = useCallback(
    (scope: ComposerScope) => {
      const cfg = aiProfileRef.current;
      if (!cfg) return false;
      return hasLlmForComposerScope(cfg, scope, getTarget(scope).llmId);
    },
    [getTarget],
  );

  const sendHome = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      const cfg = aiProfileRef.current;
      if (!text.trim() || !bridge || !cfg) return false;
      if (!assertLlm("home")) return false;
      setMobileSidebarOpen(false);

      const id = `gc${Date.now()}`;
      const newChat: GlobalChat = {
        id,
        title: truncate(text, 40),
        preview: text,
        date: "сейчас",
        history: [{ role: "user", text }],
      };

      void createChat.mutateAsync(newChat).then(() => {
        bridge.goToHref(routes.gchat(id));
        window.setTimeout(() => {
          const reply = buildAiReplyMessage(cfg, getGlobalReply(text), "home", getTarget("home"));
          void pushMessage.mutateAsync({ chatId: id, message: reply });
        }, 900);
      });

      return true;
    },
    [assertLlm, createChat, getTarget, pushMessage, setMobileSidebarOpen],
  );

  const sendGChat = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      const cfg = aiProfileRef.current;
      const chatId = bridge?.getCurrentGChatId();
      if (!text.trim() || !chatId || !cfg) return false;
      if (!assertLlm("gchat")) return false;
      void pushMessage.mutateAsync({ chatId, message: { role: "user", text } });
      window.setTimeout(() => {
        const reply = buildAiReplyMessage(cfg, getGlobalReply(text), "gchat", getTarget("gchat"));
        void pushMessage.mutateAsync({ chatId, message: reply });
      }, 900);
      return true;
    },
    [assertLlm, getTarget, pushMessage],
  );

  const sendPost = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      const cfg = aiProfileRef.current;
      if (!bridge || !cfg) return false;
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
        void addLocalChat(postId, newChat).then(() => {
          bridge.setCurrentPostChatId(chatId!);
          bridge.goToHref(routes.post(postId, chatId), { replace: true });
        });
      } else {
        void pushLocalChatMessage(postId, chatId, { role: "user", text });
      }

      const replyChatId = chatId;
      window.setTimeout(() => {
        const reply = buildAiReplyMessage(cfg, getPostReply(text), "post", getTarget("post"));
        void pushLocalChatMessage(postId, replyChatId, reply);
      }, 800);

      return true;
    },
    [addLocalChat, assertLlm, getTarget, pushLocalChatMessage],
  );

  const value = useMemo<ComposerContextValue>(
    () => ({
      sendHome,
      sendGChat,
      sendPost,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      registerNavBridge,
    }),
    [sendHome, sendGChat, sendPost, hasLlmForSend, setComposerLlm, setComposerWeb, registerNavBridge],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("useComposer must be used inside <ComposerProvider>");
  return ctx;
}

export function useComposerLabels() {
  const cfg = useProfileDraftStore(selectAiProfileConfig);
  return useMemo(
    () => ({
      llmLabel: (id: string) => resolveLlmLabel(cfg, id),
      webLabel: (id: string) => resolveWebLabel(cfg, id),
      multiResponsePairs: () => buildMultiResponsePairs(cfg.llmModels, cfg.webSearchModels),
    }),
    [cfg],
  );
}
