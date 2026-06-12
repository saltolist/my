"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import type { GlobalChatPatch } from "@/shared/api/repositories";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import {
  patchGlobalChatHistory,
  syncGlobalChatInCache,
} from "@/entities/chat/lib/patchGlobalChatHistory";
import { assistantPlainText } from "@/entities/message";
import { appendToActiveHistory } from "@/shared/lib/chatPaths";
import type { ChatMessage, GlobalChat } from "@/shared/types";

export function useGlobalChats() {
  const { chats } = useRepositories();

  return useQuery({
    queryKey: queryKeys.globalChats.list(),
    queryFn: () => chats.listGlobal(),
  });
}

export function useGlobalChat(chatId: string | null) {
  const { data: chats = [], ...rest } = useGlobalChats();
  const chat = chatId ? chats.find((c) => c.id === chatId) ?? null : null;
  return { data: chat, ...rest };
}

export function useCreateGlobalChat() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chat: GlobalChat) => chats.create(chat),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalChats.all });
    },
  });
}

export function useUpdateGlobalChat() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, patch }: { chatId: string; patch: GlobalChatPatch }) =>
      chats.update(chatId, patch),
    onSuccess: (updatedChat) => {
      syncGlobalChatInCache(queryClient, updatedChat);
    },
  });
}

function previewForMessage(message: ChatMessage): string | undefined {
  const text = assistantPlainText(message).trim();
  if (!text) return undefined;
  return text.slice(0, 80);
}

/** Добавить сообщение в конец активной ветки (GET → append → PATCH). */
export function usePushGlobalChatMessage() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: ChatMessage }) =>
      patchGlobalChatHistory(
        queryClient,
        chats,
        chatId,
        (history) => appendToActiveHistory(history, message),
        { preview: previewForMessage(message) },
      ),
  });
}

export function useRenameGlobalChat() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      chats.rename(chatId, title),
    onSuccess: (updatedChat) => {
      syncGlobalChatInCache(queryClient, updatedChat);
    },
  });
}

export function useDeleteGlobalChat() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chats.remove(chatId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalChats.all });
    },
  });
}
