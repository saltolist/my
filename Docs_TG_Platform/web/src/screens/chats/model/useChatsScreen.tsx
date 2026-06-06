"use client";

import { useCallback, useMemo, useState } from "react";
import {
  selectGlobalChats,
  selectPosts,
  useDomainSelector,
  useNavigation,
} from "@/app/model/store";
import { postTitle, chatListUserLine, chatListAssistantLine } from "@/shared/lib/helpers";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import type { ChatsTab } from "@/shared/types";
import type { LocalChatRow } from "@/entities/chat";

export type { LocalChatRow };

export function useChatsScreen() {
  const globalChatsSource = useDomainSelector(selectGlobalChats);
  const posts = useDomainSelector(selectPosts);
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
      globalChatsSource.filter((c) => {
        if (!q) return true;
        const u = chatListUserLine(c.history, c.title);
        const a = chatListAssistantLine(c.history, c.preview);
        return `${u} ${a}`.toLowerCase().includes(q);
      }),
    [globalChatsSource, q],
  );

  const localChats = useMemo(
    () =>
      posts
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
    [posts, q],
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
    data: {
      tab,
      globalChats,
      localChats,
    },
    ui: {
      isMobile,
      search,
      setSearch,
      chatsScopeSelectProps,
    },
    actions: {
      openGChat,
      goToHref,
    },
  };
}

export type ChatsScreenState = ReturnType<typeof useChatsScreen>;
