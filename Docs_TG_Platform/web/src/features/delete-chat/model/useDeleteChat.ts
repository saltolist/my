"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { useDeleteGlobalChat } from "@/entities/chat";
import { useDeleteLocalChat } from "@/entities/post";
import { parseGChatSearchParam, routes, screenFromPath } from "@/shared/lib/routes";

type GlobalTarget = { scope: "global"; chatId: string; title: string };
type LocalTarget = { scope: "local"; postId: number; chatId: number; title: string };

export function useDeleteChat() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const screen = screenFromPath(pathname);
  const gchatIdFromUrl = parseGChatSearchParam(searchParams.get("id"));
  const postChatIdFromUrl = (() => {
    const raw = searchParams.get("chat");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  })();
  const routePostId = (() => {
    const m = pathname.match(/^\/post\/(\d+)\/?$/);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
  })();

  const deleteGlobalChat = useDeleteGlobalChat();
  const deleteLocalChat = useDeleteLocalChat();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить чат «${target.title}»?`)) return;
      if (target.scope === "global") {
        void deleteGlobalChat.mutateAsync(target.chatId);
        if (screen === "gchat" && gchatIdFromUrl === target.chatId) {
          router.replace(routes.chats());
        }
      } else {
        void deleteLocalChat(target.postId, target.chatId);
        if (
          screen === "post" &&
          routePostId === target.postId &&
          postChatIdFromUrl === target.chatId
        ) {
          router.replace(routes.post(target.postId));
        }
      }
    },
    [
      deleteGlobalChat,
      deleteLocalChat,
      gchatIdFromUrl,
      postChatIdFromUrl,
      routePostId,
      router,
      screen,
    ],
  );
}
