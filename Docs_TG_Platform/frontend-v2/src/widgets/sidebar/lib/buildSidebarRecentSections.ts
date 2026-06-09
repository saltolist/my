import type { useSidebar } from "@/widgets/sidebar/model/useSidebar";
import { mapChatRows, mapNoteRows } from "@/widgets/sidebar/lib/mapRecentRows";

type SidebarState = ReturnType<typeof useSidebar>;

export function buildSidebarRecentSections(sb: SidebarState) {
  const chatItems =
    sb.recentChatsModel.mode === "flat"
      ? mapChatRows(sb.recentChatsModel.rows, sb.openChatRow, sb.isRecentChatActive)
      : [];

  const chatGrouped =
    sb.recentChatsModel.mode === "grouped"
      ? {
          thisPost: mapChatRows(
            sb.recentChatsModel.thisPost,
            sb.openChatRow,
            sb.isRecentChatActive,
          ),
          others: mapChatRows(
            sb.recentChatsModel.others,
            sb.openChatRow,
            sb.isRecentChatActive,
          ),
        }
      : undefined;

  const noteItems =
    sb.recentNotesModel.mode === "flat"
      ? mapNoteRows(sb.recentNotesModel.rows, sb.openNoteRow, sb.isRecentNoteActive)
      : [];

  const noteGrouped =
    sb.recentNotesModel.mode === "grouped"
      ? {
          thisPost: mapNoteRows(
            sb.recentNotesModel.thisPost,
            sb.openNoteRow,
            sb.isRecentNoteActive,
          ),
          others: mapNoteRows(
            sb.recentNotesModel.others,
            sb.openNoteRow,
            sb.isRecentNoteActive,
          ),
        }
      : undefined;

  return { chatItems, chatGrouped, noteItems, noteGrouped };
}
