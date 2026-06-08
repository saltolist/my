"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  useCreateGlobalChat,
  useUpdateGlobalChat,
} from "@/entities/chat/model/useGlobalChats";
import { getAiProvider } from "@/shared/lib/ai";
import { routes } from "@/shared/lib/routes";
import { Composer } from "@/widgets/composer";

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function HomeScreen() {
  const router = useRouter();
  const createChat = useCreateGlobalChat();
  const updateChat = useUpdateGlobalChat();

  const handleSubmit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const id = `gc${Date.now()}`;
      await createChat.mutateAsync({
        id,
        title: truncate(trimmed, 40),
        preview: trimmed,
        date: "сейчас",
        history: [{ role: "user", text: trimmed }],
      });

      router.push(routes.gchat(id));

      void (async () => {
        const aiText = await getAiProvider().sendMessage({ scope: "home", text: trimmed });
        await updateChat.mutateAsync({
          chatId: id,
          patch: {
            history: [
              { role: "user", text: trimmed },
              {
                role: "ai",
                text: aiText,
                llmLabel: "OpenAI / gpt-4o",
                webLabel: "Perplexity / search-api",
              },
            ],
            preview: aiText.slice(0, 80),
            date: "сейчас",
          },
        });
      })();

      return true;
    },
    [createChat, router, updateChat],
  );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-2xl items-center px-4 py-12">
      <Composer scope="home" onSubmit={handleSubmit} className="w-full" />
    </div>
  );
}
