"use client";

import { MenuIconPlus } from "@/widgets/page-header";
import { NotesScopeFilterSelect } from "@/widgets/note-editor";
import type { NotesScreenState } from "@/screens/notes/model/useNotesScreen";
import type { NoteListFilter } from "@/shared/types";

type Props = Pick<
  NotesScreenState,
  "isMobile" | "scope" | "filter" | "setScope" | "setFilter" | "newGlobal"
>;

const FILTER_TABS: { key: NoteListFilter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "ai", label: "В контексте ИИ" },
  { key: "noai", label: "Не в контексте ИИ" },
];

export default function NotesFilterRow({
  isMobile,
  scope,
  filter,
  setScope,
  setFilter,
  newGlobal,
}: Props) {
  return (
    <div className="notes-filter-row">
      {isMobile ? (
        <NotesScopeFilterSelect value={scope} onChange={setScope} />
      ) : (
        FILTER_TABS.map(({ key, label }) => (
          <div
            key={key}
            className={`filter-tab${filter === key ? " active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </div>
        ))
      )}
      {scope === "global" || scope === "all" ? (
        <button
          type="button"
          className={`filter-tab active notes-new-note-btn${isMobile ? " filter-tab--dropdown" : ""}`}
          onClick={newGlobal}
        >
          <span className="notes-new-note-btn-icon" aria-hidden>
            <MenuIconPlus size={12} strokeWidth={2} />
          </span>
          <span>Новая заметка</span>
        </button>
      ) : null}
    </div>
  );
}
