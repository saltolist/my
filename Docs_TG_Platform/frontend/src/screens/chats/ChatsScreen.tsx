"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { ChatListCard } from "@/entities/chat";
import { useGlobalChats } from "@/entities/chat/model/useGlobalChats";
import { usePosts } from "@/entities/post/model/usePosts";
import { postTitle } from "@/shared/lib/postTitle";
import { routes } from "@/shared/lib/routes";
import type { ChatsTab, LocalChat } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { FilterTabs } from "@/shared/ui/filter-tabs";
import { SearchField } from "@/shared/ui/search-field";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/widgets/page-header";

const TAB_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "global" as const, label: "Глобальные" },
  { value: "local" as const, label: "Локальные" },
];

type LocalChatRow = {
  postId: number;
  postTitle: string;
  chat: LocalChat;
};

function matchesSearch(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return text.toLowerCase().includes(q);
}

export function ChatsScreen() {
  const { data: globalChats = [], isLoading: chatsLoading } = useGlobalChats();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const [tab, setTab] = useState<ChatsTab>("all");
  const [search, setSearch] = useState("");

  const filteredGlobal = useMemo(
    () =>
      globalChats.filter((c) =>
        matchesSearch(`${c.title} ${c.preview}`, search),
      ),
    [globalChats, search],
  );

  const localRows = useMemo<LocalChatRow[]>(
    () =>
      posts.flatMap((post) =>
        post.chats.map((chat) => ({
          postId: post.id,
          postTitle: postTitle(post),
          chat,
        })),
      ),
    [posts],
  );

  const filteredLocal = useMemo(
    () =>
      localRows.filter((row) =>
        matchesSearch(`${row.chat.title} ${row.chat.preview} ${row.postTitle}`, search),
      ),
    [localRows, search],
  );

  const isLoading = chatsLoading || postsLoading;
  const showGlobal = tab === "all" || tab === "global";
  const showLocal = tab === "all" || tab === "local";
  const isEmpty =
    (showGlobal ? filteredGlobal.length : 0) + (showLocal ? filteredLocal.length : 0) === 0;

  return (
    <>
      <PageHeader
        title="Чаты"
        center={
          <SearchField
            placeholder="Поиск по чатам…"
            value={search}
            onChange={setSearch}
            aria-label="Поиск по чатам"
            className="w-full max-w-md"
          />
        }
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs value={tab} options={TAB_OPTIONS} onChange={setTab} ariaLabel="Область чатов" />
          <Link
            href={routes.home()}
            className="ml-auto text-sm font-medium text-primary hover:underline"
          >
            Новый чат
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={<MessageSquare className="size-5" />}
            message={
              tab === "global"
                ? "Нет глобальных чатов"
                : tab === "local"
                  ? "Нет локальных чатов"
                  : "Нет чатов"
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {showGlobal
              ? filteredGlobal.map((chat) => (
                  <ChatListCard
                    key={chat.id}
                    title={chat.title}
                    preview={chat.preview}
                    date={chat.date}
                    href={routes.gchat(chat.id)}
                  />
                ))
              : null}
            {showLocal
              ? filteredLocal.map((row) => (
                  <ChatListCard
                    key={`${row.postId}-${row.chat.id}`}
                    title={row.chat.title}
                    preview={row.chat.preview}
                    date={row.chat.date}
                    subtitle={row.postTitle}
                    href={routes.post(row.postId, row.chat.id)}
                  />
                ))
              : null}
          </div>
        )}
      </div>
    </>
  );
}
