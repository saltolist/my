"use client";

import { ContextMenu } from "@/shared/ui/context-menu";
import { MessageRenameIcon, MessageTrashIcon } from "@/entities/message";
import type { RecentRow } from "@/widgets/sidebar/model/types";

type Props = {
  row: RecentRow;
  isActive: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
};

export default function SidebarRecentChatRow({
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
              const next = window.prompt("Новое название чата", row.title);
              if (next == null) return;
              const t = next.trim();
              if (!t) return;
              onRename(t);
            },
          },
          {
            label: "Удалить чат",
            icon: <MessageTrashIcon />,
            danger: true,
            onClick: () => {
              if (!window.confirm(`Удалить чат «${row.title}»?`)) return;
              onDelete();
            },
          },
        ]}
      />
    </div>
  );
}
