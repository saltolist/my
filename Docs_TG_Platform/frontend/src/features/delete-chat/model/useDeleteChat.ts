"use client";

import { useDeleteGlobalChat } from "@/entities/chat/model/useGlobalChats";

export function useDeleteChat() {
  return useDeleteGlobalChat();
}
