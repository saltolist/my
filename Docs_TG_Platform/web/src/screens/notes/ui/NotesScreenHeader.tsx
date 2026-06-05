"use client";

import PageHeader from "@/widgets/page-header/ui/PageHeader";
import PageHeaderSearchInput from "@/widgets/page-header/ui/PageHeaderSearchInput";
import PageHeaderSelect from "@/widgets/page-header/ui/PageHeaderSelect";
import type { NotesScreenState } from "@/screens/notes/model/useNotesScreen";

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
