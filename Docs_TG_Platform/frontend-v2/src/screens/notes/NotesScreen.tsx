"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { useTopLevelBack } from "@/shared/lib/hooks/useTopLevelBack";
import type { NoteListFilter } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { FilterTabs } from "@/shared/ui/filter-tabs";
import { SearchField } from "@/shared/ui/search-field";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader, PageHeaderMenuButton } from "@/widgets/page-header";

const FILTER_OPTIONS = [
  { value: "all" as const, label: "Все" },
  { value: "ai" as const, label: "В контексте" },
  { value: "noai" as const, label: "Не в контексте" },
];

export function NotesScreen() {
  const onBack = useTopLevelBack();
  const [filter, setFilter] = useState<NoteListFilter>("all");
  const [search, setSearch] = useState("");

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Заметки"
          center={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Поиск по заметкам…"
                aria-label="Поиск по заметкам"
                className="w-44 sm:w-52"
              />
              <FilterTabs
                value={filter}
                options={FILTER_OPTIONS}
                onChange={setFilter}
                ariaLabel="Фильтр заметок"
              />
            </div>
          }
          onBack={onBack}
          actions={
            <PageHeaderMenuButton
              items={[{ label: "Новая заметка", onClick: () => {} }]}
              aria-label="Действия с заметками"
            />
          }
        />
      }
    >
      <EmptyState
        icon={<FileText className="size-5" />}
        message="Сетка заметок появится на следующем шаге."
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
