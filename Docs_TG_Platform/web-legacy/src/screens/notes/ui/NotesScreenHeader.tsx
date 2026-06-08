"use client";

import { PageHeader, PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";
import type { NotesScreenState } from "@/screens/notes/model/useNotesScreen";

type Props = {
  ui: Pick<
    NotesScreenState["ui"],
    "isMobile" | "search" | "setSearch" | "notesScopeSelectProps" | "notesContextFilterSelectProps"
  >;
};

export default function NotesScreenHeader({ ui }: Props) {
  const { isMobile, search, setSearch, notesScopeSelectProps, notesContextFilterSelectProps } = ui;

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
