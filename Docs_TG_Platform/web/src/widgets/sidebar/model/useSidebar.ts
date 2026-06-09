"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigationStore, useUiStore } from "@/app/model/store";
import { useGlobalChats } from "@/entities/chat/model/useGlobalChats";
import { useGlobalNotes } from "@/entities/note/model/useGlobalNotes";
import { usePosts } from "@/entities/post/model/usePosts";
import { RAIL_MIN_MQ, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import {
  parseAppPath,
  routes,
  screenFromPath,
} from "@/shared/config/routes";
import type { ScreenId } from "@/shared/types";
import {
  buildRecentChatsModel,
  buildRecentNotesModel,
} from "@/widgets/sidebar/lib/buildRecentModels";
import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";

type UseSidebarOptions = {
  onNavigate?: () => void;
};

export function useSidebar({ onNavigate }: UseSidebarOptions = {}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const route = parseAppPath(pathname);
  const screen = screenFromPath(pathname);

  const railAllowed = useMediaQuery(RAIL_MIN_MQ);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  const { data: posts = [] } = usePosts();
  const { data: globalChats = [] } = useGlobalChats();
  const { data: globalNotes = [] } = useGlobalNotes();

  const [notesExpanded, setNotesExpanded] = useState(false);
  const [chatsExpanded, setChatsExpanded] = useState(true);

  const currentGChatId = useNavigationStore((s) => s.currentGChatId);
  const currentPostChatId = useNavigationStore((s) => s.currentPostChatId);

  const sidebarData = useMemo(
    () => ({ posts, globalChats, globalNotes }),
    [posts, globalChats, globalNotes],
  );

  const sidebarPostId = useMemo((): number | null => {
    if (screen === "post" && route.postId != null) return route.postId;
    if (screen === "note" && route.notePostId != null) return route.notePostId;
    return null;
  }, [screen, route.postId, route.notePostId]);

  const currentPostSidebar = useMemo(() => {
    if (sidebarPostId == null) return null;
    return posts.find((p) => p.id === sidebarPostId) ?? null;
  }, [sidebarPostId, posts]);

  const showFeedPostRow =
    sidebarPostId != null && (screen === "post" || (screen === "note" && route.notePostId != null));

  const isSidebarPostFullActive =
    sidebarPostId != null &&
    screen === "post" &&
    route.postId === sidebarPostId &&
    currentPostChatId == null;

  const isSidebarPostSubActive =
    sidebarPostId != null &&
    !isSidebarPostFullActive &&
    ((screen === "post" &&
      route.postId === sidebarPostId &&
      currentPostChatId != null) ||
      (screen === "note" && route.notePostId === sidebarPostId));

  const recentChatsModel = useMemo(
    () => buildRecentChatsModel(sidebarData, sidebarPostId),
    [sidebarData, sidebarPostId],
  );

  const recentNotesModel = useMemo(
    () => buildRecentNotesModel(sidebarData, sidebarPostId),
    [sidebarData, sidebarPostId],
  );

  const railActive = railAllowed && sidebarCollapsed;

  useEffect(() => {
    document.documentElement.classList.toggle("sidebar-collapsed", railActive);
    return () => document.documentElement.classList.remove("sidebar-collapsed");
  }, [railActive]);

  useEffect(() => {
    if (railActive) {
      setChatsExpanded(false);
      setNotesExpanded(false);
    }
  }, [railActive]);

  useEffect(() => {
    if (screen === "note") setNotesExpanded(true);
    if (screen === "gchat") setChatsExpanded(true);
  }, [screen]);

  const goTo = useCallback(
    (href: string) => {
      router.push(href);
      onNavigate?.();
    },
    [router, onNavigate],
  );

  const navigateScreen = useCallback(
    (target: ScreenId) => {
      switch (target) {
        case "home":
          goTo(routes.home());
          break;
        case "feed":
          goTo(routes.feed());
          break;
        case "analytics":
          goTo(routes.analytics());
          break;
        case "notes":
          goTo(routes.notes());
          break;
        case "chats":
          goTo(routes.chats());
          break;
        case "profile":
          goTo(routes.profile());
          break;
        default:
          goTo(routes.home());
      }
    },
    [goTo],
  );

  const openPost = useCallback(
    (postId: number) => {
      goTo(routes.post(postId));
    },
    [goTo],
  );

  const openNotesNav = useCallback(() => {
    if (railActive) setSidebarCollapsed(false);
    navigateScreen("notes");
  }, [railActive, setSidebarCollapsed, navigateScreen]);

  const openChatsNav = useCallback(() => {
    if (railActive) setSidebarCollapsed(false);
    navigateScreen("chats");
  }, [railActive, setSidebarCollapsed, navigateScreen]);

  const openChatRow = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global") {
        goTo(routes.gchat(row.id));
        return;
      }
      goTo(routes.post(row.postId, row.chatId));
    },
    [goTo],
  );

  const openNoteRow = useCallback(
    (row: RecentNoteRow) => {
      if (row.kind === "global") {
        goTo(routes.noteGlobal(row.id));
        return;
      }
      goTo(routes.notePost(row.postId, row.noteId));
    },
    [goTo],
  );

  const isRecentChatActive = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global") {
        return screen === "gchat" && currentGChatId === row.id;
      }
      return (
        screen === "post" &&
        route.postId === row.postId &&
        currentPostChatId === row.chatId
      );
    },
    [screen, route.postId, currentGChatId, currentPostChatId],
  );

  const isRecentNoteActive = useCallback(
    (row: RecentNoteRow) => {
      if (screen !== "note") return false;
      if (row.kind === "global") {
        return route.noteGlobalId === row.id;
      }
      return route.notePostId === row.postId && route.noteId === row.noteId;
    },
    [screen, route.noteGlobalId, route.notePostId, route.noteId],
  );

  const isScreenActive = useCallback(
    (target: ScreenId) => {
      if (target === "home") return screen === "home";
      if (target === "gchat") return screen === "gchat";
      return screen === target;
    },
    [screen],
  );

  return {
    screen,
    railAllowed,
    railActive,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    notesExpanded,
    setNotesExpanded,
    chatsExpanded,
    setChatsExpanded,
    recentChatsModel,
    recentNotesModel,
    currentPostSidebar,
    showFeedPostRow,
    isSidebarPostFullActive,
    isSidebarPostSubActive,
    openPost,
    goHome: () => navigateScreen("home"),
    navigateScreen,
    openNotesNav,
    openChatsNav,
    openChatRow,
    openNoteRow,
    isRecentChatActive,
    isRecentNoteActive,
    isScreenActive,
  };
}
