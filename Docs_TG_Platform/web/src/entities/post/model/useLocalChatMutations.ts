"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getCachedPost, setCachedPost } from "@/entities/post/lib/getCachedPost";
import type { ChatMessage, LocalChat } from "@/shared/types";

import { useUpdatePost } from "./usePosts";

export function useAddLocalChat() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, chat: LocalChat) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const updated = { ...post, chats: [...post.chats, chat] };
      await updatePost.mutateAsync({
        id: postId,
        patch: { chats: updated.chats },
      });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function usePushLocalChatMessage() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, chatId: number, message: ChatMessage) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const chats = post.chats.map((chat) => {
        if (chat.id !== chatId) return chat;
        const history = [...chat.history, message];
        const preview =
          message.role === "ai" && message.text
            ? message.text.slice(0, 80)
            : chat.preview;
        return { ...chat, history, preview };
      });
      const updated = { ...post, chats };
      await updatePost.mutateAsync({ id: postId, patch: { chats } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function useRenameLocalChat() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, chatId: number, title: string) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const chats = post.chats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat,
      );
      const updated = { ...post, chats };
      await updatePost.mutateAsync({ id: postId, patch: { chats } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function useDeleteLocalChat() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, chatId: number) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const chats = post.chats.filter((chat) => chat.id !== chatId);
      const updated = { ...post, chats };
      await updatePost.mutateAsync({ id: postId, patch: { chats } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}
