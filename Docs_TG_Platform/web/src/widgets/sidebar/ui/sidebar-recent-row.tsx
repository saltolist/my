"use client";

import { MessageRenameIcon, MessageTrashIcon } from "@/entities/message";
import { ContextMenu } from "@/shared/ui/context-menu";

export type SidebarRecentRowKind = "chat" | "note";

export type SidebarRecentRowItem = {
  key: string;
  title: string;
  active?: boolean;
  onOpen: () => void;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  onRename?: (title: string) => void;
  onDelete?: () => void;
  kind?: SidebarRecentRowKind;
};

type SidebarRecentRowProps = {
  item: SidebarRecentRowItem;
};

export function SidebarRecentRow({ item }: SidebarRecentRowProps) {
  const hasMenu = item.onRename != null && item.onDelete != null && item.onMenuOpenChange != null;
  const renamePrompt =
    item.kind === "note" ? "Новое название заметки" : "Новое название чата";
  const deleteLabel = item.kind === "note" ? "Удалить заметку" : "Удалить чат";

  return (
    <div
      className={`nav-recent-chat-row${item.active ? " active" : ""}${
        item.menuOpen ? " nav-recent-chat-row--menu" : ""
      }`}
    >
      <button type="button" className="nav-recent-chat" onClick={item.onOpen}>
        <span className="nav-recent-chat-title">{item.title}</span>
      </button>
      {hasMenu ? (
        <ContextMenu
          className="nav-recent-chat-ctx"
          align="left"
          portal
          onOpenChange={item.onMenuOpenChange}
          trigger={<span className="nav-recent-chat-dots">⋯</span>}
          items={[
            {
              label: "Переименовать",
              icon: <MessageRenameIcon />,
              onClick: () => {
                const next = window.prompt(renamePrompt, item.title);
                if (next == null) return;
                const t = next.trim();
                if (!t) return;
                item.onRename?.(t);
              },
            },
            {
              label: deleteLabel,
              icon: <MessageTrashIcon />,
              danger: true,
              onClick: () => {
                if (!window.confirm(`Удалить ${item.kind === "note" ? "заметку" : "чат"} «${item.title}»?`)) {
                  return;
                }
                item.onDelete?.();
              },
            },
          ]}
        />
      ) : null}
    </div>
  );
}
