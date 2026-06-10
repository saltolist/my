"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "@/app/model/store/ui-store";
import { useComposerTargetStore } from "@/app/model/store/composer-target-store";
import {
  buildAiReplyMessage,
  hasLlmForComposerScope,
  resolveLlmLabel,
  resolveWebLabel,
} from "@/app/model/store/composer/helpers";
import {
  useCreateGlobalChat,
  usePushGlobalChatMessage,
  useUpdateGlobalChat,
} from "@/entities/chat";
import { useAiProfile } from "@/entities/channel";
import { queryKeys } from "@/shared/api/queryKeys";
import { getGlobalReply } from "@/shared/lib/replies";
import { routes } from "@/shared/lib/routes";
import { truncate } from "@/shared/lib/helpers";
import { buildMultiResponsePairs } from "@/shared/config/composer";
import type { ComposerScope, GlobalChat } from "@/shared/types";

export type ComposerNavBridge = {
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  getCurrentGChatId: () => string | null;
};

export type ComposerContextValue = {
  sendHome: (text: string) => boolean;
  sendGChat: (text: string) => boolean;
  hasLlmForSend: (scope: ComposerScope) => boolean;
  setComposerLlm: (scope: ComposerScope, llmId: string) => void;
  setComposerWeb: (scope: ComposerScope, webId: string) => void;
  registerNavBridge: (bridge: ComposerNavBridge) => () => void;
};

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: aiProfile } = useAiProfile();
  const createChat = useCreateGlobalChat();
  const pushMessage = usePushGlobalChatMessage();
  const updateChat = useUpdateGlobalChat();
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
          const chats = queryClient.getQueryData<GlobalChat[]>(queryKeys.globalChats.list()) ?? [];
          const chat = chats.find((c) => c.id === id);
          if (!chat) return;
          const reply = buildAiReplyMessage(cfg, getGlobalReply(text), "home", getTarget("home"));
          void updateChat.mutateAsync({
            chatId: id,
            patch: { history: [...chat.history, reply], preview: reply.text?.slice(0, 80) ?? chat.preview },
          });
        }, 900);
      });

      return true;
    },
    [assertLlm, createChat, getTarget, queryClient, setMobileSidebarOpen, updateChat],
  );

  const sendGChat = useCallback(
    (text: string) => {
      const bridge = navBridgeRef.current;
      const chatId = bridge?.getCurrentGChatId();
      if (!text.trim() || !chatId) return false;
      if (!assertLlm("gchat")) return false;
      void pushMessage.mutateAsync({ chatId, text });
      return true;
    },
    [assertLlm, pushMessage],
  );

  const value = useMemo<ComposerContextValue>(
    () => ({
      sendHome,
      sendGChat,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      registerNavBridge,
    }),
    [sendHome, sendGChat, hasLlmForSend, setComposerLlm, setComposerWeb, registerNavBridge],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("useComposer must be used inside <ComposerProvider>");
  return ctx;
}

export function useComposerLabels() {
  const { data: cfg } = useAiProfile();
  return useMemo(
    () => ({
      llmLabel: (id: string) => (cfg ? resolveLlmLabel(cfg, id) : ""),
      webLabel: (id: string) => (cfg ? resolveWebLabel(cfg, id) : ""),
      multiResponsePairs: () => (cfg ? buildMultiResponsePairs(cfg.llmModels, cfg.webSearchModels) : []),
    }),
    [cfg],
  );
}
