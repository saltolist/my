"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";

import { useTopLevelBack } from "@/shared/lib/hooks/useTopLevelBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { FeedHeaderToolbar } from "@/widgets/feed/ui/feed-header-toolbar";
import { PageHeader } from "@/widgets/page-header";

export function FeedScreen() {
  const onBack = useTopLevelBack();
  const [search, setSearch] = useState("");

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Лента"
          center={<FeedHeaderToolbar value={search} onChange={setSearch} />}
          onBack={onBack}
        />
      }
    >
      <EmptyState
        icon={<Newspaper className="size-5" />}
        message={
          search.trim()
            ? `Поиск «${search.trim()}» — контент ленты появится на следующем шаге.`
            : "Секции «Опубликованные», «Отложенные» и «Черновики» появятся здесь."
        }
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
