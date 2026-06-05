"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import { isOmnichannelChat, isOmnichannelChatId } from "@/lib/omnichannel";
import { parseAppPath, parseGChatSearchParam, routes } from "@/lib/routes";
import { globalChatById, useDomain } from "@/state/domain-store";
import { useComposer } from "@/state/composer-store";
import { useNavigation } from "@/state/navigation-store";

export function useGlobalChatScreen() {
  const { state: domain, dispatch } = useDomain();
  const { currentGChatId, navigateBack, goToHref } = useNavigation();
  const { sendGChat } = useComposer();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  const chatId =
    parseAppPath(pathname).gchatId ??
    parseGChatSearchParam(searchParams.get("id")) ??
    currentGChatId;

  const chat = globalChatById(domain, chatId);
  const omnichannel = chat ? isOmnichannelChat(chat) : isOmnichannelChatId(chatId);
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatHistory = chat?.history;

  const flatMessages = useMemo(
    () => flattenVisibleWithPaths(chatHistory ?? []),
    [chatHistory],
  );
  const lastAssistantFlat = useMemo(
    () => lastAssistantFlatIndex(flatMessages),
    [flatMessages],
  );

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [flatMessages.length]);

  const navigateBackToChats = useCallback(() => {
    navigateBack("chats");
  }, [navigateBack]);

  const deleteChat = useCallback(() => {
    if (!chat) return;
    if (!confirm(`Удалить чат «${chat.title}»?`)) return;
    dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: chat.id });
    goToHref(routes.chats(), { replace: true });
  }, [chat, dispatch, goToHref]);

  return {
    chat,
    omnichannel,
    flatMessages,
    lastAssistantFlat,
    messagesRef,
    navigateBackToChats,
    deleteChat,
    sendGChat,
  };
}

export type GlobalChatScreenState = ReturnType<typeof useGlobalChatScreen>;
