"use client";

import { useState } from "react";

import { EmptyState } from "@/shared/ui/empty-state";
import { NavIconFeed } from "@/shared/ui/nav-icons";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { FeedHeaderToolbar } from "@/widgets/feed/ui/feed-header-toolbar";
import { PageHeader } from "@/widgets/page-header";

export function FeedScreen() {
  const [search, setSearch] = useState("");

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Лента"
          backTo="home"
          compactSearchAtWidth={804}
          search={<FeedHeaderToolbar value={search} onChange={setSearch} />}
        />
      }
    >
      <EmptyState
        icon={<NavIconFeed />}
        message={
          search.trim()
            ? `Поиск «${search.trim()}» — контент ленты появится на следующем шаге.`
            : "Секции «Опубликованные», «Отложенные» и «Черновики» появятся здесь."
        }
      />
    </ScreenShell>
  );
}
