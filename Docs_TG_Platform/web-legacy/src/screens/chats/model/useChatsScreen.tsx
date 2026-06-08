"use client";

import { useCallback, useMemo, useState } from "react";
import {
  selectGlobalChats,
  selectPosts,
  useDomainSelector,
  useNavigation,
} from "@/app/model/store";
import {
  buildLocalChatRows,
  filterGlobalChats,
  filterLocalChatRows,
  type LocalChatRow,
} from "@/entities/chat";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import type { ChatsTab } from "@/shared/types";

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

  const globalChats = useMemo(
    () => filterGlobalChats(globalChatsSource, search),
    [globalChatsSource, search],
  );

  const localChats = useMemo(
    () => filterLocalChatRows(buildLocalChatRows(posts), search),
    [posts, search],
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
