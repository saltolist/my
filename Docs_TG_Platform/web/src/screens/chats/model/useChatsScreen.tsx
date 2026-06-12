"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useNavigationStore } from "@/app/model/store";
import {
  buildLocalChatRows,
  filterGlobalChats,
  filterLocalChatRows,
} from "@/entities/chat/lib/chatList";
import { useGlobalChats } from "@/entities/chat";
import { usePosts } from "@/entities/post";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { routes } from "@/shared/lib/routes";
import type { ChatsTab } from "@/shared/types";

export function useChatsScreen() {
  const router = useRouter();
  const isMobile = useMobile760();
  const tab = useNavigationStore((s) => s.chatsTab);
  const search = useNavigationStore((s) => s.chatsSearch);

  const { data: globalChatsSource = [], isLoading: globalLoading } = useGlobalChats();
  const { data: posts = [], isLoading: postsLoading } = usePosts();

  const globalChats = useMemo(
    () => filterGlobalChats(globalChatsSource, search),
    [globalChatsSource, search],
  );

  const localChats = useMemo(
    () => filterLocalChatRows(buildLocalChatRows(posts), search),
    [posts, search],
  );

  return {
    data: {
      tab,
      globalChats,
      localChats,
      isLoading: globalLoading || postsLoading,
    },
    ui: {
      isMobile,
    },
    actions: {
      openGChat: (id: string) => router.push(routes.gchat(id)),
      goToHref: (href: string) => router.push(href),
      setTab: (t: ChatsTab) => useNavigationStore.getState().setChatsTab(t),
    },
  };
}

export type ChatsScreenState = ReturnType<typeof useChatsScreen>;
