"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";

import { useNavigationStore } from "@/app/model/store";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import type { NoteListFilter, NoteScope } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { NotesFilterRow } from "@/screens/notes/ui/NotesFilterRow";
import { PageHeader, PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";

const SCOPE_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "global" as const, label: "Глобальные" },
  { value: "local" as const, label: "Локальные" },
];

const FILTER_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "ai" as const, label: "В контексте" },
  { value: "noai" as const, label: "Не в контексте" },
];

export function NotesScreen() {
  const onBack = useScreenBack();
  const isMobile = useMobile760();
  const scope = useNavigationStore((s) => s.noteScope);
  const filter = useNavigationStore((s) => s.noteFilter);
  const setNoteScope = useNavigationStore((s) => s.setNoteScope);
  const setNoteFilter = useNavigationStore((s) => s.setNoteFilter);
  const search = useNavigationStore((s) => s.notesSearch);
  const setNotesSearch = useNavigationStore((s) => s.setNotesSearch);

  const notesScopeSelectProps = useMemo(
    () => ({
      ariaLabel: "Область заметок",
      value: scope,
      options: SCOPE_OPTIONS,
      onChange: (v: string) => setNoteScope(v as NoteScope),
    }),
    [scope, setNoteScope],
  );

  const notesContextFilterSelectProps = useMemo(
    () => ({
      ariaLabel: "Контекст заметок",
      value: filter,
      options: FILTER_OPTIONS,
      onChange: (v: string) => setNoteFilter(v as NoteListFilter),
    }),
    [filter, setNoteFilter],
  );

  return (
    <ScreenShell
      bodyClassName="notes-page"
      header={
        <PageHeader
          title="Заметки"
          onBack={onBack}
          mobileSelect={
            isMobile ? <PageHeaderSelect {...notesContextFilterSelectProps} /> : undefined
          }
          search={
            <div className="page-header-search-tools-row">
              <PageHeaderSearchInput
                placeholder="Поиск по заметкам..."
                value={search}
                onChange={(e) => setNotesSearch(e.target.value)}
                onDismiss={() => setNotesSearch("")}
              />
              <div className="page-header-scope-select page-header-toolbar--desktop">
                <PageHeaderSelect {...notesScopeSelectProps} />
              </div>
            </div>
          }
        />
      }
    >
      <NotesFilterRow />
      <EmptyState
        icon={<FileText className="size-5" />}
        message="Сетка заметок появится на следующем шаге."
      />
    </ScreenShell>
  );
}
