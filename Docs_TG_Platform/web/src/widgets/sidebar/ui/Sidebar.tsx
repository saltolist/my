"use client";

import { useSidebar } from "@/widgets/sidebar/model/useSidebar";
import NavItem from "./NavItem";
import {
  NavIconAnalytics,
  NavIconFeed,
  NavIconPlus,
  NavIconProfile,
} from "./NavIcons";
import SidebarFeedPostRow from "./SidebarFeedPostRow";
import SidebarHeader from "./SidebarHeader";
import SidebarRecentChatsSection from "./SidebarRecentChatsSection";
import SidebarRecentNotesSection from "./SidebarRecentNotesSection";
import type { RecentRow } from "@/widgets/sidebar/model/types";

export default function Sidebar() {
  const sb = useSidebar();

  const openChatRow = (row: RecentRow) => {
    if (row.kind === "global") sb.openGChat(row.id);
    else sb.openLocalChat(row.postId, row.chatId);
  };

  return (
    <>
      <nav id="sidebar" className={sb.railActive ? "sidebar--collapsed" : undefined}>
        <SidebarHeader
          railAllowed={sb.railAllowed}
          railActive={sb.railActive}
          onExpand={() => sb.setSidebarCollapsed(false)}
          onCollapse={() => sb.setSidebarCollapsed(true)}
          onGoHome={sb.goHome}
        />

        <div className="nav-items">
          <button
            type="button"
            className={`nav-item${sb.screen === "home" ? " active" : ""}`}
            onClick={sb.goHome}
            title="Глобальный чат"
            aria-label="Глобальный чат"
          >
            <span className="nav-icon">
              <NavIconPlus />
            </span>
            <span className="nav-label">Глобальный чат</span>
          </button>

          <NavItem
            id="analytics"
            label="Аналитика"
            icon={<NavIconAnalytics />}
            active={sb.screen === "analytics"}
            onClick={() => sb.navigate("analytics")}
          />

          <NavItem
            id="feed"
            label="Лента"
            icon={<NavIconFeed />}
            active={sb.screen === "feed"}
            onClick={() => sb.navigate("feed")}
          />

          {sb.showFeedPostRow && sb.currentPostSidebar ? (
            <SidebarFeedPostRow
              post={sb.currentPostSidebar}
              isFullActive={sb.isSidebarPostFullActive}
              isSubActive={sb.isSidebarPostSubActive}
              menuOpen={sb.feedPostMenuOpen}
              onMenuOpenChange={sb.setFeedPostMenuOpen}
              onOpen={() => sb.openPost(sb.currentPostSidebar!.id)}
              menuItems={sb.feedPostCtxItems}
            />
          ) : null}

          <SidebarRecentNotesSection
            screen={sb.screen}
            expanded={sb.notesExpanded}
            onToggleExpanded={() => sb.setNotesExpanded((v) => !v)}
            onOpenNotesNav={sb.openNotesNav}
            model={sb.recentNotesModel}
            menuOpenKey={sb.recentNotesMenuOpenKey}
            onMenuOpenKeyChange={sb.setRecentNotesMenuOpenKey}
            isRowActive={sb.isRecentNoteActive}
            onOpenRow={sb.openNoteFromRow}
            onRenameRow={sb.renameRecentNote}
            onDeleteRow={sb.deleteRecentNote}
          />

          <SidebarRecentChatsSection
            screen={sb.screen}
            expanded={sb.chatsExpanded}
            onToggleExpanded={() => sb.setChatsExpanded((v) => !v)}
            onOpenChatsNav={sb.openChatsNav}
            model={sb.recentChatsModel}
            menuOpenKey={sb.recentMenuOpenKey}
            onMenuOpenKeyChange={sb.setRecentMenuOpenKey}
            isRowActive={sb.isRecentChatActive}
            onOpenRow={openChatRow}
            onRenameRow={sb.renameRecentChat}
            onDeleteRow={sb.deleteRecentChat}
          />
        </div>

        <div className="sidebar-bottom">
          <NavItem
            id="profile"
            label="Профиль"
            icon={<NavIconProfile />}
            active={sb.screen === "profile"}
            onClick={() => sb.navigate("profile")}
          />
        </div>
      </nav>
      {sb.scheduleModal}
    </>
  );
}
