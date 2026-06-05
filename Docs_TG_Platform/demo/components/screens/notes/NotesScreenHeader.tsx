"use client";

import PageHeader from "@/components/PageHeader";
import PageHeaderSearchInput from "@/components/PageHeaderSearchInput";
import PageHeaderSelect from "@/components/PageHeaderSelect";
import type { NotesScreenState } from "@/lib/hooks/useNotesScreen";

type Props = Pick<
  NotesScreenState,
  "isMobile" | "search" | "setSearch" | "notesScopeSelectProps" | "notesContextFilterSelectProps"
>;

export default function NotesScreenHeader({
  isMobile,
  search,
  setSearch,
  notesScopeSelectProps,
  notesContextFilterSelectProps,
}: Props) {
  return (
    <PageHeader
      title="Заметки"
      backTo="home"
      mobileSelect={
        isMobile ? <PageHeaderSelect {...notesContextFilterSelectProps} /> : undefined
      }
      search={
        <div className="page-header-search-tools-row">
          <PageHeaderSearchInput
            placeholder="Поиск по заметкам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onDismiss={() => setSearch("")}
          />
          <div className="page-header-scope-select page-header-toolbar--desktop">
            <PageHeaderSelect {...notesScopeSelectProps} />
          </div>
        </div>
      }
    />
  );
}
