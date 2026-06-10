"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";

import { useNavigationStore } from "@/app/model/store";
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
  const tab = useNavigationStore((s) => s.chatsTab);
  const setChatsTab = useNavigationStore((s) => s.setChatsTab);
  const search = useNavigationStore((s) => s.chatsSearch);
  const setChatsSearch = useNavigationStore((s) => s.setChatsSearch);

  const chatsScopeSelectProps = useMemo(
    () => ({
      ariaLabel: "Область чатов",
      value: tab,
      options: TAB_OPTIONS,
      onChange: (v: string) => setChatsTab(v as ChatsTab),
    }),
    [tab, setChatsTab],
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
                onChange={(e) => setChatsSearch(e.target.value)}
                onDismiss={() => setChatsSearch("")}
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
