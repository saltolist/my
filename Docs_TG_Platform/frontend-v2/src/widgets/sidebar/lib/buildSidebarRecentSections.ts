import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";
import type { SidebarRecentRowItem } from "@/widgets/sidebar/ui/sidebar-recent-row";
import type { useSidebar } from "@/widgets/sidebar/model/useSidebar";

function mapChatRow(row: RecentRow, sb: ReturnType<typeof useSidebar>): SidebarRecentRowItem {
  return {
    key: row.key,
    title: row.title,
    active: sb.isRecentChatActive(row),
    onOpen: () => sb.openRecentChat(row),
  };
}

function mapNoteRow(row: RecentNoteRow, sb: ReturnType<typeof useSidebar>): SidebarRecentRowItem {
  return {
    key: row.key,
    title: row.title,
    active: sb.isRecentNoteActive(row),
    onOpen: () => sb.openRecentNote(row),
  };
}

export function buildSidebarRecentSections(sb: ReturnType<typeof useSidebar>) {
  const chats = sb.recentChatsModel;
  const notes = sb.recentNotesModel;

  if (chats.mode === "grouped") {
    return {
      chatItems: [] as SidebarRecentRowItem[],
      chatGrouped: {
        thisPost: chats.thisPost.map((r) => mapChatRow(r, sb)),
        others: chats.others.map((r) => mapChatRow(r, sb)),
      },
      noteItems: [] as SidebarRecentRowItem[],
      noteGrouped:
        notes.mode === "grouped"
          ? {
              thisPost: notes.thisPost.map((r) => mapNoteRow(r, sb)),
              others: notes.others.map((r) => mapNoteRow(r, sb)),
            }
          : undefined,
    };
  }

  return {
    chatItems: chats.rows.map((r) => mapChatRow(r, sb)),
    chatGrouped: undefined,
    noteItems:
      notes.mode === "flat" ? notes.rows.map((r) => mapNoteRow(r, sb)) : ([] as SidebarRecentRowItem[]),
    noteGrouped:
      notes.mode === "grouped"
        ? {
            thisPost: notes.thisPost.map((r) => mapNoteRow(r, sb)),
            others: notes.others.map((r) => mapNoteRow(r, sb)),
          }
        : undefined,
  };
}
