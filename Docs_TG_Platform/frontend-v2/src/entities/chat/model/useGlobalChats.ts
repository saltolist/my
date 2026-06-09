"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import type { GlobalChatPatch } from "@/shared/api/repositories";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type { GlobalChat } from "@/shared/types";

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalChats.all });
    },
  });
}

export function usePushGlobalChatMessage() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      chats.pushMessage(chatId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalChats.all });
    },
  });
}

export function useRenameGlobalChat() {
  const { chats } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      chats.rename(chatId, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalChats.all });
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
