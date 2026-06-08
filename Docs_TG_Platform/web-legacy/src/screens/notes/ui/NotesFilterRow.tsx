"use client";

import { FilterToolbar, FilterToolbarAction } from "@/widgets/filter-toolbar";
import { NotesScopeFilterSelect } from "@/widgets/note-editor";
import type { NotesScreenState } from "@/screens/notes/model/useNotesScreen";
import type { NoteListFilter } from "@/shared/types";

type Props = {
  data: Pick<NotesScreenState["data"], "scope" | "filter">;
  ui: Pick<NotesScreenState["ui"], "isMobile">;
  actions: Pick<NotesScreenState["actions"], "setScope" | "setFilter" | "newGlobal">;
};

const FILTER_TABS: { value: NoteListFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "ai", label: "В контексте ИИ" },
  { value: "noai", label: "Не в контексте ИИ" },
];

export default function NotesFilterRow({ data, ui, actions }: Props) {
  const { scope, filter } = data;
  const { isMobile } = ui;
  const { setScope, setFilter, newGlobal } = actions;

  return (
    <FilterToolbar
      className="notes-filter-row"
      width="content"
      tabs={FILTER_TABS}
      value={filter}
      onChange={setFilter}
      mobileFilter={<NotesScopeFilterSelect value={scope} onChange={setScope} />}
      selectClassName="notes-filter-tab-select"
      tabAriaLabel="Фильтр заметок"
      action={
        scope === "global" || scope === "all" ? (
          <FilterToolbarAction
            label="Новая заметка"
            onClick={newGlobal}
            className={`filter-tab active notes-new-note-btn${isMobile ? " filter-tab--dropdown" : ""}`}
            iconClassName="notes-new-note-btn-icon"
          />
        ) : null
      }
    />
  );
}
