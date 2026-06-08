"use client";

import { NavIconChats } from "./NavIcons";
import SidebarChevron from "./SidebarChevron";
import SidebarRecentChatRow from "./SidebarRecentChatRow";
import type { RecentChatsModel, RecentRow } from "@/widgets/sidebar/model/types";

type Props = {
  screen: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onOpenChatsNav: () => void;
  model: RecentChatsModel;
  menuOpenKey: string | null;
  onMenuOpenKeyChange: (key: string | null) => void;
  isRowActive: (row: RecentRow) => boolean;
  onOpenRow: (row: RecentRow) => void;
  onRenameRow: (row: RecentRow, title: string) => void;
  onDeleteRow: (row: RecentRow) => void;
};

function RecentChatList({
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
> & { rows: RecentRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <SidebarRecentChatRow
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

export default function SidebarRecentChatsSection({
  screen,
  expanded,
  onToggleExpanded,
  onOpenChatsNav,
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
      <div className={`nav-item nav-item--chats-row${screen === "chats" ? " active" : ""}`}>
        <button type="button" className="nav-item-chats-main" onClick={onOpenChatsNav}>
          <span className="nav-icon">
            <NavIconChats />
          </span>
          <span className="nav-label">Чаты</span>
        </button>
        <SidebarChevron
          expanded={expanded}
          label={expanded ? "Свернуть список чатов" : "Развернуть список чатов"}
          onToggle={onToggleExpanded}
        />
      </div>

      {expanded ? (
        <div className="nav-recent-chats">
          {model.mode === "flat" ? (
            <RecentChatList
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
                <div className="nav-recent-empty">Чатов нет</div>
              ) : (
                <RecentChatList
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
                <div className="nav-recent-empty">Чатов нет</div>
              ) : (
                <RecentChatList
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
