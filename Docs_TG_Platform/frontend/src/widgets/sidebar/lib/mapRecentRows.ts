import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";
import type { SidebarRecentRowItem } from "@/widgets/sidebar/ui/sidebar-recent-row";

export function mapChatRows(
  rows: RecentRow[],
  openChatRow: (row: RecentRow) => void,
  isRecentChatActive: (row: RecentRow) => boolean,
): SidebarRecentRowItem[] {
  return rows.map((row) => ({
    key: row.key,
    title: row.title,
    active: isRecentChatActive(row),
    onOpen: () => openChatRow(row),
  }));
}

export function mapNoteRows(
  rows: RecentNoteRow[],
  openNoteRow: (row: RecentNoteRow) => void,
  isRecentNoteActive: (row: RecentNoteRow) => boolean,
): SidebarRecentRowItem[] {
  return rows.map((row) => ({
    key: row.key,
    title: row.title,
    active: isRecentNoteActive(row),
    onOpen: () => openNoteRow(row),
  }));
}

export function openMenuItem(item: SidebarRecentRowItem) {
  return [{ label: "Открыть", onClick: item.onOpen }];
}
