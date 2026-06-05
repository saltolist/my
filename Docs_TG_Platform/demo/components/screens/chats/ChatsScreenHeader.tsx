"use client";

import PageHeader from "@/components/PageHeader";
import PageHeaderSearchInput from "@/components/PageHeaderSearchInput";
import PageHeaderSelect from "@/components/PageHeaderSelect";
import type { ChatsScreenState } from "@/lib/hooks/useChatsScreen";

type Props = Pick<
  ChatsScreenState,
  "isMobile" | "search" | "setSearch" | "chatsScopeSelectProps"
>;

export default function ChatsScreenHeader({
  isMobile,
  search,
  setSearch,
  chatsScopeSelectProps,
}: Props) {
  return (
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
  );
}
