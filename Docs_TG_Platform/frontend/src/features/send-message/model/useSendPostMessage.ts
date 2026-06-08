"use client";

import { useCallback } from "react";
import { usePost, useUpdatePost } from "@/entities/post/model/usePosts";
import { getAiProvider } from "@/shared/lib/ai";
import type { ChatMessage, LocalChat } from "@/shared/types";

function nextChatId(chats: LocalChat[]): number {
  if (chats.length === 0) return 1;
  return Math.max(...chats.map((c) => c.id)) + 1;
}

export function useSendPostMessage(postId: number) {
  const { data: post } = usePost(postId);
  const updatePost = useUpdatePost();

  return useCallback(
    async (text: string, chatId: number | null) => {
      const trimmed = text.trim();
      if (!trimmed || !post) return false;

      const aiText = await getAiProvider().sendMessage({
        scope: "post",
        text: trimmed,
        postId,
      });

      const userMsg: ChatMessage = { role: "user", text: trimmed };
      const aiMsg: ChatMessage = {
        role: "ai",
        text: aiText,
        llmLabel: "OpenAI / gpt-4o",
      };

      let chats = [...post.chats];
      let targetChatId = chatId;

      if (targetChatId == null) {
        targetChatId = nextChatId(chats);
        const newChat: LocalChat = {
          id: targetChatId,
          title: trimmed.slice(0, 40) || "Новый чат",
          preview: aiText.slice(0, 80),
          date: "сейчас",
          history: [userMsg, aiMsg],
          ai: true,
        };
        chats = [newChat, ...chats];
      } else {
        chats = chats.map((chat) => {
          if (chat.id !== targetChatId) return chat;
          const history = [...chat.history, userMsg, aiMsg];
          return {
            ...chat,
            history,
            preview: aiText.slice(0, 80),
            date: "сейчас",
          };
        });
      }

      await updatePost.mutateAsync({
        id: postId,
        patch: { chats },
      });

      return { chatId: targetChatId };
    },
    [post, postId, updatePost],
  );
}
