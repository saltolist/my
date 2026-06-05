"use client";

import { ContextMenu } from "@/shared/ui/context-menu";
import MessageRenameIcon from "@/entities/message/ui/MessageRenameIcon";
import MessageTrashIcon from "@/entities/message/ui/MessageTrashIcon";
import type { RecentNoteRow } from "@/widgets/sidebar/model/types";

type Props = {
  row: RecentNoteRow;
  isActive: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
};

export default function SidebarRecentNoteRow({
  row,
  isActive,
  menuOpen,
  onMenuOpenChange,
  onOpen,
  onRename,
  onDelete,
}: Props) {
  return (
    <div
      className={`nav-recent-chat-row${isActive ? " active" : ""}${
        menuOpen ? " nav-recent-chat-row--menu" : ""
      }`}
    >
      <button type="button" className="nav-recent-chat" onClick={onOpen}>
        <span className="nav-recent-chat-title">{row.title}</span>
      </button>
      <ContextMenu
        className="nav-recent-chat-ctx"
        align="left"
        portal
        onOpenChange={onMenuOpenChange}
        trigger={<span className="nav-recent-chat-dots">⋯</span>}
        items={[
          {
            label: "Переименовать",
            icon: <MessageRenameIcon />,
            onClick: () => {
              const next = window.prompt("Новое название заметки", row.title);
              if (next == null) return;
              const t = next.trim();
              if (!t) return;
              onRename(t);
            },
          },
          {
            label: "Удалить заметку",
            icon: <MessageTrashIcon />,
            danger: true,
            onClick: () => {
              if (!window.confirm(`Удалить заметку «${row.title}»?`)) return;
              onDelete();
            },
          },
        ]}
      />
    </div>
  );
}
