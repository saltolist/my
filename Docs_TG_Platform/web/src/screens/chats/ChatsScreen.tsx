"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";

import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import type { ChatsTab } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader, PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";

const TAB_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "global" as const, label: "Глобальные" },
  { value: "local" as const, label: "Локальные" },
];

export function ChatsScreen() {
  const isMobile = useMobile760();
  const [tab, setTab] = useState<ChatsTab>("all");
  const [search, setSearch] = useState("");

  const chatsScopeSelectProps = useMemo(
    () => ({
      ariaLabel: "Область чатов",
      value: tab,
      options: TAB_OPTIONS,
      onChange: (v: string) => setTab(v as ChatsTab),
    }),
    [tab],
  );

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Чаты"
          backTo="home"
          mobileSelect={isMobile ? <PageHeaderSelect {...chatsScopeSelectProps} /> : undefined}
          search={
            <div className="page-header-search-tools-row">
              <PageHeaderSearchInput
                placeholder="Поиск по чатам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onDismiss={() => setSearch("")}
              />
              <div className="page-header-scope-select page-header-toolbar--desktop">
                <PageHeaderSelect {...chatsScopeSelectProps} />
              </div>
            </div>
          }
        />
      }
    >
      <EmptyState
        icon={<MessageSquare className="size-5" />}
        message="Каталог чатов появится на следующем шаге. В сайдбаре — недавние из seed-data через MSW."
      />
    </ScreenShell>
  );
}
