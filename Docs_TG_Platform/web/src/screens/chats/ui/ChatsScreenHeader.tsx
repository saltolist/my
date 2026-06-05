"use client";

import { PageHeader, PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";
import type { ChatsScreenState } from "@/screens/chats/model/useChatsScreen";

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
