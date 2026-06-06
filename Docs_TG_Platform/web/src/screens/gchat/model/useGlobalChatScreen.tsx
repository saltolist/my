"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/shared/lib/chatPaths";
import { isOmnichannelChat, isOmnichannelChatId } from "@/shared/lib/omnichannel";
import { parseAppPath, parseGChatSearchParam, routes } from "@/shared/lib/routes";
import { globalChatById, domainActions, useDomainDispatch, useDomainSelector, useComposer, useNavigation } from "@/app/model/store";

export function useGlobalChatScreen() {
  const dispatch = useDomainDispatch();
  const { currentGChatId, navigateBack, goToHref } = useNavigation();
  const { sendGChat } = useComposer();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  const chatId =
    parseAppPath(pathname).gchatId ??
    parseGChatSearchParam(searchParams.get("id")) ??
    currentGChatId;

  const chat = useDomainSelector((s) => globalChatById(s, chatId));
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
    dispatch(domainActions.deleteGlobalChat(chat.id));
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
