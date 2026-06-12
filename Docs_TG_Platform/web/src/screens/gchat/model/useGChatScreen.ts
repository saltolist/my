"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { useComposer } from "@/app/model/store/composer-store";
import { useGlobalChat } from "@/entities/chat";
import {
  flattenVisibleWithPaths,
  lastAssistantFlatIndex,
  normalizeBranchedHistory,
  visibleHistoryRevision,
} from "@/shared/lib/chatPaths";
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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [flatMessages.length]);

  return {
    gchatId,
    chat,
    isLoading,
    error,
    flatMessages,
    historyRevision,
    lastAssistantFlat,
    messagesRef,
    sendGChat,
  };
}
