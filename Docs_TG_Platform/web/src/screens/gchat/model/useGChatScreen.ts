"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";

import { useComposer } from "@/app/model/store/composer-store";
import { useGlobalChat } from "@/entities/chat";
import {
  flattenVisibleWithPaths,
  lastAssistantFlatIndex,
  normalizeBranchedHistory,
  visibleHistoryRevision,
} from "@/shared/lib/chatPaths";
import { useChatThreadAutoScroll } from "@/shared/lib/hooks/useChatThreadAutoScroll";
import { parseGChatSearchParam } from "@/shared/lib/routes";

export function useGChatScreen() {
  const searchParams = useSearchParams();
  const gchatId = parseGChatSearchParam(searchParams.get("id"));
  const { data: chat, isLoading, error } = useGlobalChat(gchatId);
  const { sendGChat } = useComposer();
  const messagesRef = useRef<HTMLDivElement>(null);

  const history = normalizeBranchedHistory(chat?.history ?? []);
  const historyRevision = visibleHistoryRevision(history);
  const flatMessages = flattenVisibleWithPaths(history);
  const lastAssistantFlat = lastAssistantFlatIndex(flatMessages);

  useChatThreadAutoScroll(messagesRef, flatMessages.length, historyRevision);

  return {
    gchatId,
    chat,
    isLoading,
    error,
    flatMessages,
    lastAssistantFlat,
    messagesRef,
    sendGChat,
  };
}
