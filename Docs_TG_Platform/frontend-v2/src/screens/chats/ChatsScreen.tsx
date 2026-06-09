"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { useTopLevelBack } from "@/shared/lib/hooks/useTopLevelBack";
import type { ChatsTab } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { FilterTabs } from "@/shared/ui/filter-tabs";
import { SearchField } from "@/shared/ui/search-field";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

const TAB_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "global" as const, label: "Глобальные" },
  { value: "local" as const, label: "Локальные" },
];

export function ChatsScreen() {
  const onBack = useTopLevelBack();
  const [tab, setTab] = useState<ChatsTab>("all");
  const [search, setSearch] = useState("");

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Чаты"
          center={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Поиск по чатам…"
                aria-label="Поиск по чатам"
                className="w-44 sm:w-52"
              />
              <FilterTabs value={tab} options={TAB_OPTIONS} onChange={setTab} ariaLabel="Тип чатов" />
            </div>
          }
          onBack={onBack}
        />
      }
    >
      <EmptyState
        icon={<MessageSquare className="size-5" />}
        message="Каталог чатов появится на следующем шаге. В сайдбаре уже доступны недавние (preview-данные)."
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
