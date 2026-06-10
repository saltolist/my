"use client";

import { useNavigationStore } from "@/app/model/store";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { NavIconFeed } from "@/shared/ui/nav-icons";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { FeedHeaderToolbar } from "@/widgets/feed/ui/feed-header-toolbar";
import { PageHeader } from "@/widgets/page-header";

export function FeedScreen() {
  const onBack = useScreenBack();
  const search = useNavigationStore((s) => s.feedSearch);
  const setFeedSearch = useNavigationStore((s) => s.setFeedSearch);

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Лента"
          onBack={onBack}
          compactSearchAtWidth={804}
          search={<FeedHeaderToolbar value={search} onChange={setFeedSearch} />}
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
