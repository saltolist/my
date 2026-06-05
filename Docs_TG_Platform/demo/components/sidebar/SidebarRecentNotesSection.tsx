"use client";

import { NavIconNotes } from "./NavIcons";
import SidebarChevron from "./SidebarChevron";
import SidebarRecentNoteRow from "./SidebarRecentNoteRow";
import type { RecentNoteRow, RecentNotesModel } from "./types";

type Props = {
  screen: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onOpenNotesNav: () => void;
  model: RecentNotesModel;
  menuOpenKey: string | null;
  onMenuOpenKeyChange: (key: string | null) => void;
  isRowActive: (row: RecentNoteRow) => boolean;
  onOpenRow: (row: RecentNoteRow) => void;
  onRenameRow: (row: RecentNoteRow, title: string) => void;
  onDeleteRow: (row: RecentNoteRow) => void;
};

function RecentNoteList({
  rows,
  menuOpenKey,
  onMenuOpenKeyChange,
  isRowActive,
  onOpenRow,
  onRenameRow,
  onDeleteRow,
}: Pick<
  Props,
  | "menuOpenKey"
  | "onMenuOpenKeyChange"
  | "isRowActive"
  | "onOpenRow"
  | "onRenameRow"
  | "onDeleteRow"
> & { rows: RecentNoteRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <SidebarRecentNoteRow
          key={row.key}
          row={row}
          isActive={isRowActive(row)}
          menuOpen={menuOpenKey === row.key}
          onMenuOpenChange={(open) => onMenuOpenKeyChange(open ? row.key : null)}
          onOpen={() => onOpenRow(row)}
          onRename={(title) => onRenameRow(row, title)}
          onDelete={() => onDeleteRow(row)}
        />
      ))}
    </>
  );
}

export default function SidebarRecentNotesSection({
  screen,
  expanded,
  onToggleExpanded,
  onOpenNotesNav,
  model,
  menuOpenKey,
  onMenuOpenKeyChange,
  isRowActive,
  onOpenRow,
  onRenameRow,
  onDeleteRow,
}: Props) {
  return (
    <>
      <div id="nav-notes" className={`nav-item nav-item--chats-row${screen === "notes" ? " active" : ""}`}>
        <button type="button" className="nav-item-chats-main" onClick={onOpenNotesNav}>
          <span className="nav-icon">
            <NavIconNotes />
          </span>
          <span className="nav-label">Заметки</span>
        </button>
        <SidebarChevron
          expanded={expanded}
          label={expanded ? "Свернуть список заметок" : "Развернуть список заметок"}
          onToggle={onToggleExpanded}
        />
      </div>

      {expanded ? (
        <div className="nav-recent-chats">
          {model.mode === "flat" ? (
            <RecentNoteList
              rows={model.rows}
              menuOpenKey={menuOpenKey}
              onMenuOpenKeyChange={onMenuOpenKeyChange}
              isRowActive={isRowActive}
              onOpenRow={onOpenRow}
              onRenameRow={onRenameRow}
              onDeleteRow={onDeleteRow}
            />
          ) : (
            <>
              <div className="nav-recent-chats-section-label">Этот пост</div>
              {model.thisPost.length === 0 ? (
                <div className="nav-recent-empty">Заметок нет</div>
              ) : (
                <RecentNoteList
                  rows={model.thisPost}
                  menuOpenKey={menuOpenKey}
                  onMenuOpenKeyChange={onMenuOpenKeyChange}
                  isRowActive={isRowActive}
                  onOpenRow={onOpenRow}
                  onRenameRow={onRenameRow}
                  onDeleteRow={onDeleteRow}
                />
              )}
              <div className="nav-recent-chats-section-label">Остальные</div>
              {model.others.length === 0 ? (
                <div className="nav-recent-empty">Заметок нет</div>
              ) : (
                <RecentNoteList
                  rows={model.others}
                  menuOpenKey={menuOpenKey}
                  onMenuOpenKeyChange={onMenuOpenKeyChange}
                  isRowActive={isRowActive}
                  onOpenRow={onOpenRow}
                  onRenameRow={onRenameRow}
                  onDeleteRow={onDeleteRow}
                />
              )}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
