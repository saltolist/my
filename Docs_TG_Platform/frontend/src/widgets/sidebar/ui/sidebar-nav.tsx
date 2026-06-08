"use client";

import { buildSidebarRecentSections } from "@/widgets/sidebar/lib/buildSidebarRecentSections";
import { openMenuItem } from "@/widgets/sidebar/lib/mapRecentRows";
import type { useSidebar } from "@/widgets/sidebar/model/useSidebar";
import { SidebarNavItem } from "@/widgets/sidebar/ui/SidebarNavItem";
import { SidebarRecentList } from "@/widgets/sidebar/ui/SidebarRecentList";
import {
  NavIconAnalytics,
  NavIconChats,
  NavIconFeed,
  NavIconGlobalChat,
  NavIconNotes,
} from "@/widgets/sidebar/ui/nav-icons";
import { SidebarExpandableNav } from "@/widgets/sidebar/ui/sidebar-expandable-nav";
import { SidebarFeedPostRow } from "@/widgets/sidebar/ui/sidebar-feed-post-row";

type SidebarNavProps = {
  sb: ReturnType<typeof useSidebar>;
  showLabels: boolean;
};

export function SidebarNav({ sb, showLabels }: SidebarNavProps) {
  const { chatItems, chatGrouped, noteItems, noteGrouped } = buildSidebarRecentSections(sb);

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Основная навигация">
      <SidebarNavItem
        label="Глобальный чат"
        icon={<NavIconGlobalChat />}
        active={sb.isScreenActive("home")}
        onClick={sb.goHome}
        showLabel={showLabels}
      />
      <SidebarNavItem
        label="Аналитика"
        icon={<NavIconAnalytics />}
        active={sb.isScreenActive("analytics")}
        onClick={() => sb.navigateScreen("analytics")}
        showLabel={showLabels}
      />
      <SidebarNavItem
        label="Лента"
        icon={<NavIconFeed />}
        active={sb.isScreenActive("feed")}
        onClick={() => sb.navigateScreen("feed")}
        showLabel={showLabels}
      />

      {showLabels && sb.showFeedPostRow && sb.currentPostSidebar ? (
        <SidebarFeedPostRow
          post={sb.currentPostSidebar}
          isFullActive={sb.isSidebarPostFullActive}
          isSubActive={sb.isSidebarPostSubActive}
          onOpen={() => sb.openPost(sb.currentPostSidebar!.id)}
        />
      ) : null}

      <SidebarExpandableNav
        label="Заметки"
        icon={<NavIconNotes />}
        active={sb.isScreenActive("notes") || sb.isScreenActive("note")}
        expanded={sb.notesExpanded}
        showLabel={showLabels}
        expandLabel="Развернуть недавние заметки"
        collapseLabel="Свернуть недавние заметки"
        onNavClick={sb.openNotesNav}
        onToggleExpanded={() => sb.setNotesExpanded((v) => !v)}
      >
        <SidebarRecentList items={noteItems} grouped={noteGrouped} menuItems={openMenuItem} />
      </SidebarExpandableNav>

      <SidebarExpandableNav
        label="Чаты"
        icon={<NavIconChats />}
        active={sb.isScreenActive("chats") || sb.isScreenActive("gchat")}
        expanded={sb.chatsExpanded}
        showLabel={showLabels}
        expandLabel="Развернуть недавние чаты"
        collapseLabel="Свернуть недавние чаты"
        onNavClick={sb.openChatsNav}
        onToggleExpanded={() => sb.setChatsExpanded((v) => !v)}
      >
        <SidebarRecentList items={chatItems} grouped={chatGrouped} menuItems={openMenuItem} />
      </SidebarExpandableNav>
    </nav>
  );
}
