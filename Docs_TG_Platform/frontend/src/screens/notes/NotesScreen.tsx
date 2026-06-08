"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import { NoteCard } from "@/entities/note";
import { useGlobalNotes } from "@/entities/note/model/useGlobalNotes";
import { useToggleNoteAi } from "@/features/toggle-note-ai";
import { routes } from "@/shared/lib/routes";
import type { GlobalNote, NoteListFilter } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { FilterTabs } from "@/shared/ui/filter-tabs";
import { SearchField } from "@/shared/ui/search-field";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/widgets/page-header";

const FILTER_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "ai" as const, label: "В контексте" },
  { value: "noai" as const, label: "Не в контексте" },
];

function matchesFilter(note: GlobalNote, filter: NoteListFilter): boolean {
  if (filter === "ai") return note.ai;
  if (filter === "noai") return !note.ai;
  return true;
}

export function NotesScreen() {
  const { data: notes = [], isLoading } = useGlobalNotes();
  const toggleAi = useToggleNoteAi();
  const [filter, setFilter] = useState<NoteListFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((note) => {
      if (!matchesFilter(note, filter)) return false;
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q)
      );
    });
  }, [filter, notes, search]);

  const handleToggleAi = (note: GlobalNote) => {
    void toggleAi.mutateAsync({
      ...note,
      isGlobal: true,
      files: note.files ?? [],
    });
  };

  return (
    <>
      <PageHeader title="Заметки" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            placeholder="Поиск по заметкам…"
            value={search}
            onChange={setSearch}
            aria-label="Поиск по заметкам"
            className="max-w-xs"
          />
          <FilterTabs
            value={filter}
            options={FILTER_OPTIONS}
            onChange={setFilter}
            ariaLabel="Фильтр заметок"
          />
          <Link
            href={routes.noteNew("notes")}
            className="ml-auto text-sm font-medium text-primary hover:underline"
          >
            Новая заметка
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            message="Нет заметок"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                variant="global"
                title={note.title}
                body={note.body}
                date={note.date}
                ai={note.ai}
                href={routes.noteGlobal(note.id)}
                onToggleAi={() => handleToggleAi(note)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
