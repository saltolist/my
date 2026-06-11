import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";
import type { SidebarRecentRowItem } from "@/widgets/sidebar/ui/sidebar-recent-row";

type ChatMapOptions = {
  menuOpenKey: string | null;
  onMenuOpenKeyChange: (key: string | null) => void;
  onRenameRow: (row: RecentRow, title: string) => void;
  onDeleteRow: (row: RecentRow) => void;
};

type NoteMapOptions = {
  menuOpenKey: string | null;
  onMenuOpenKeyChange: (key: string | null) => void;
  onRenameRow: (row: RecentNoteRow, title: string) => void;
  onDeleteRow: (row: RecentNoteRow) => void;
};

export function mapChatRows(
  rows: RecentRow[],
  openChatRow: (row: RecentRow) => void,
  isRecentChatActive: (row: RecentRow) => boolean,
  menu: ChatMapOptions,
): SidebarRecentRowItem[] {
  return rows.map((row) => ({
    key: row.key,
    title: row.title,
    active: isRecentChatActive(row),
    onOpen: () => openChatRow(row),
    kind: "chat" as const,
    menuOpen: menu.menuOpenKey === row.key,
    onMenuOpenChange: (open) => menu.onMenuOpenKeyChange(open ? row.key : null),
    onRename: (title) => menu.onRenameRow(row, title),
    onDelete: () => menu.onDeleteRow(row),
  }));
}

export function mapNoteRows(
  rows: RecentNoteRow[],
  openNoteRow: (row: RecentNoteRow) => void,
  isRecentNoteActive: (row: RecentNoteRow) => boolean,
  menu: NoteMapOptions,
): SidebarRecentRowItem[] {
  return rows.map((row) => ({
    key: row.key,
    title: row.title,
    active: isRecentNoteActive(row),
    onOpen: () => openNoteRow(row),
    kind: "note" as const,
    menuOpen: menu.menuOpenKey === row.key,
    onMenuOpenChange: (open) => menu.onMenuOpenKeyChange(open ? row.key : null),
    onRename: (title) => menu.onRenameRow(row, title),
    onDelete: () => menu.onDeleteRow(row),
  }));
}
