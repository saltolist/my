"use client";

import { useRenameGlobalChat } from "@/entities/chat/model/useGlobalChats";

export function useRenameChat() {
  return useRenameGlobalChat();
}
