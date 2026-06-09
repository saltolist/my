"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useUiStore } from "@/app/model/store";
import { previewDomain } from "@/shared/data/preview-seed";
import { RAIL_MIN_MQ, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { routes, screenFromPath } from "@/shared/config/routes";
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
  const screen = screenFromPath(pathname);

  const railAllowed = useMediaQuery(RAIL_MIN_MQ);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);

  const [notesExpanded, setNotesExpanded] = useState(false);
  const [chatsExpanded, setChatsExpanded] = useState(true);

  const sidebarPostId: number | null = null;

  const recentChatsModel = useMemo(
    () => buildRecentChatsModel(previewDomain, sidebarPostId),
    [sidebarPostId],
  );

  const recentNotesModel = useMemo(
    () => buildRecentNotesModel(previewDomain, sidebarPostId),
    [sidebarPostId],
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
    if (screen === "notes") setNotesExpanded(true);
    if (screen === "chats") setChatsExpanded(true);
  }, [screen]);

  const goTo = useCallback(
    (href: string) => {
      router.push(href);
      onNavigate?.();
    },
    [router, onNavigate],
  );

  const goHome = useCallback(() => goTo(routes.home()), [goTo]);
  const openNotesNav = useCallback(() => goTo(routes.notes()), [goTo]);
  const openChatsNav = useCallback(() => goTo(routes.chats()), [goTo]);

  const navigateScreen = useCallback(
    (target: ScreenId) => {
      switch (target) {
        case "home":
          goHome();
          break;
        case "feed":
          goTo(routes.feed());
          break;
        case "chats":
          openChatsNav();
          break;
        case "notes":
          openNotesNav();
          break;
        case "analytics":
          goTo(routes.analytics());
          break;
        case "profile":
          goTo(routes.profile());
          break;
        default:
          break;
      }
    },
    [goHome, goTo, openChatsNav, openNotesNav],
  );

  const isScreenActive = useCallback(
    (target: ScreenId) => {
      if (target === "home") return screen === "home";
      if (target === "feed") return screen === "feed";
      if (target === "analytics") return screen === "analytics";
      if (target === "profile") return screen === "profile";
      if (target === "notes") return screen === "notes";
      if (target === "chats") return screen === "chats";
      return false;
    },
    [screen],
  );

  const openRecentChat = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global" && row.id) {
        goTo(routes.chats());
        return;
      }
      if (row.kind === "local" && row.postId != null) {
        goTo(routes.chats());
      }
    },
    [goTo],
  );

  const openRecentNote = useCallback(
    (row: RecentNoteRow) => {
      goTo(routes.notes());
    },
    [goTo],
  );

  const isRecentChatActive = useCallback((_row: RecentRow) => false, []);
  const isRecentNoteActive = useCallback((_row: RecentNoteRow) => false, []);

  return {
    screen,
    railAllowed,
    railActive,
    setSidebarCollapsed,
    goHome,
    navigateScreen,
    isScreenActive,
    notesExpanded,
    setNotesExpanded,
    chatsExpanded,
    setChatsExpanded,
    openNotesNav,
    openChatsNav,
    recentChatsModel,
    recentNotesModel,
    openRecentChat,
    openRecentNote,
    isRecentChatActive,
    isRecentNoteActive,
  };
}
