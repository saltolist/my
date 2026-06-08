"use client";

import { useCallback } from "react";
import { usePushGlobalChatMessage } from "@/entities/chat/model/useGlobalChats";
import { getAiProvider } from "@/shared/lib/ai";

export function useSendGlobalMessage(scope: "home" | "gchat") {
  const pushMessage = usePushGlobalChatMessage();

  return useCallback(
    async (chatId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      await getAiProvider().sendMessage({ scope, text: trimmed });
      await pushMessage.mutateAsync({ chatId, text: trimmed });
      return true;
    },
    [pushMessage, scope],
  );
}
