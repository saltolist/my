"use client";

import { useCallback, useMemo, useState } from "react";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";
import { postTitle, chatListUserLine, chatListAssistantLine } from "@/shared/lib/helpers";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import type { ChatMessage, ChatsTab } from "@/shared/types";

export type LocalChatRow = {
  postId: number;
  postTitle: string;
  chatId: number;
  title: string;
  preview: string;
  date: string;
  history: ChatMessage[];
};

export function useChatsScreen() {
  const { state: domain } = useDomain();
  const { chatsTab: tab, openGChat, goToHref, navDispatch } = useNavigation();
  const isMobile = useMobile760();
  const [search, setSearch] = useState("");

  const setTab = useCallback(
    (t: ChatsTab) => navDispatch({ type: "SET_NAV", patch: { chatsTab: t } }),
    [navDispatch],
  );

  const q = search.trim().toLowerCase();

  const globalChats = useMemo(
    () =>
      domain.globalChats.filter((c) => {
        if (!q) return true;
        const u = chatListUserLine(c.history, c.title);
        const a = chatListAssistantLine(c.history, c.preview);
        return `${u} ${a}`.toLowerCase().includes(q);
      }),
    [domain.globalChats, q],
  );

  const localChats = useMemo(
    () =>
      domain.posts
        .flatMap((p) =>
          p.chats.map<LocalChatRow>((c) => ({
            postId: p.id,
            postTitle: postTitle(p),
            chatId: c.id,
            title: c.title || "Без названия",
            preview: c.preview || "",
            date: c.date || "",
            history: c.history,
          })),
        )
        .filter((row) => {
          if (!q) return true;
          const u = chatListUserLine(row.history, row.title);
          const a = chatListAssistantLine(row.history, row.preview);
          return `${u} ${a} ${row.postTitle}`.toLowerCase().includes(q);
        }),
    [domain.posts, q],
  );

  const chatsScopeSelectProps = useMemo(
    () => ({
      ariaLabel: "Область чатов",
      value: tab,
      options: [
        { value: "all", label: "Все" },
        { value: "global", label: "Глобальные" },
        { value: "local", label: "Локальные" },
      ],
      onChange: (v: string) => setTab(v as ChatsTab),
    }),
    [setTab, tab],
  );

  return {
    tab,
    isMobile,
    search,
    setSearch,
    globalChats,
    localChats,
    openGChat,
    goToHref,
    chatsScopeSelectProps,
  };
}

export type ChatsScreenState = ReturnType<typeof useChatsScreen>;
