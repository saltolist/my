"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { usePostCtxMenuItems } from "@/features/post-context-menu";
import { buildRecentChatsModel, buildRecentNotesModel } from "@/widgets/sidebar/lib/buildRecentModels";
import { RAIL_MQ, SIDEBAR_COLLAPSED_KEY } from "@/widgets/sidebar/model/types";
import { parseAppPath, routes, screenFromPath } from "@/shared/lib/routes";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";
import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";

export function useSidebar() {
  const { state: domain, dispatch } = useDomain();
  const {
    navigate,
    goHome,
    openPost,
    openGChat,
    goToHref,
    postMode,
    currentNote,
    currentPostId,
    currentPostChatId,
    currentGChatId,
  } = useNavigation();

  const pathname = usePathname() ?? "/";
  const route = parseAppPath(pathname);
  const screen = screenFromPath(pathname);

  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [recentMenuOpenKey, setRecentMenuOpenKey] = useState<string | null>(null);
  const [recentNotesMenuOpenKey, setRecentNotesMenuOpenKey] = useState<string | null>(null);
  const [feedPostMenuOpen, setFeedPostMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [railAllowed, setRailAllowed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(RAIL_MQ);
    const sync = () => setRailAllowed(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
    } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    const collapsed = railAllowed && sidebarCollapsed;
    document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
    return () => document.documentElement.classList.remove("sidebar-collapsed");
  }, [railAllowed, sidebarCollapsed]);

  useEffect(() => {
    if (railAllowed && sidebarCollapsed) {
      setChatsExpanded(false);
      setNotesExpanded(false);
    }
  }, [railAllowed, sidebarCollapsed]);

  useEffect(() => {
    if (screen === "note") setNotesExpanded(true);
    if (screen === "gchat") setChatsExpanded(true);
    if (screen === "post" && postMode === "notes") setNotesExpanded(true);
  }, [screen, postMode]);

  const sidebarPostId = useMemo((): number | null => {
    if (screen === "post" && route.postId != null) return route.postId;
    const note = currentNote;
    if (screen === "note" && note && !note.isGlobal) return note.postId;
    return null;
  }, [screen, route.postId, currentNote]);

  const recentChatsModel = useMemo(
    () => buildRecentChatsModel(domain, sidebarPostId),
    [domain, sidebarPostId],
  );

  const recentNotesModel = useMemo(
    () => buildRecentNotesModel(domain, sidebarPostId),
    [domain, sidebarPostId],
  );

  const currentPostSidebar = useMemo(() => {
    if (sidebarPostId == null) return null;
    return domain.posts.find((p) => p.id === sidebarPostId) ?? null;
  }, [sidebarPostId, domain.posts]);

  const showFeedPostRow =
    sidebarPostId != null &&
    (screen === "post" || (screen === "note" && currentNote != null && !currentNote.isGlobal));

  const isSidebarPostFullActive =
    sidebarPostId != null &&
    screen === "post" &&
    currentPostId === sidebarPostId &&
    !(postMode === "chat" && currentPostChatId != null);

  const isSidebarPostSubActive =
    sidebarPostId != null &&
    !isSidebarPostFullActive &&
    ((screen === "post" &&
      currentPostId === sidebarPostId &&
      postMode === "chat" &&
      currentPostChatId != null) ||
      (screen === "note" &&
        currentNote != null &&
        !currentNote.isGlobal &&
        currentNote.postId === sidebarPostId));

  const { items: feedPostCtxItems, modal: scheduleModal } = usePostCtxMenuItems(currentPostSidebar);

  const railActive = railAllowed && sidebarCollapsed;

  const openNotesNav = useCallback(() => {
    if (railAllowed && sidebarCollapsed) setSidebarCollapsed(false);
    navigate("notes");
  }, [navigate, railAllowed, sidebarCollapsed]);

  const openChatsNav = useCallback(() => {
    if (railAllowed && sidebarCollapsed) setSidebarCollapsed(false);
    navigate("chats");
  }, [navigate, railAllowed, sidebarCollapsed]);

  const openLocalChat = useCallback(
    (postId: number, chatId: number) => {
      goToHref(routes.post(postId, chatId));
    },
    [goToHref],
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

  const openNoteFromRow = useCallback(
    (row: RecentNoteRow) => {
      if (row.kind === "global") {
        const n = domain.globalNotes.find((x) => x.id === row.id);
        if (!n) return;
        goToHref(routes.noteGlobal(row.id));
      } else {
        const post = domain.posts.find((p) => p.id === row.postId);
        const n = post?.notes.find((x) => x.id === row.noteId);
        if (!n || !post) return;
        goToHref(routes.notePost(row.postId, row.noteId));
      }
    },
    [domain.globalNotes, domain.posts, goToHref],
  );

  const isRecentNoteActive = useCallback(
    (row: RecentNoteRow) => {
      if (screen !== "note" || !currentNote) return false;
      if (row.kind === "global") {
        return currentNote.isGlobal === true && currentNote.id === row.id;
      }
      return (
        currentNote.isGlobal === false &&
        currentNote.postId === row.postId &&
        currentNote.id === row.noteId
      );
    },
    [screen, currentNote],
  );

  const renameRecentChat = useCallback(
    (row: RecentRow, title: string) => {
      if (row.kind === "global") {
        dispatch({ type: "RENAME_GLOBAL_CHAT", chatId: row.id, title });
      } else {
        dispatch({
          type: "RENAME_LOCAL_CHAT",
          postId: row.postId,
          chatId: row.chatId,
          title,
        });
      }
    },
    [dispatch],
  );

  const deleteRecentChat = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global") {
        dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: row.id });
        if (screen === "gchat" && currentGChatId === row.id) {
          goToHref(routes.chats(), { replace: true });
        }
      } else {
        dispatch({
          type: "DELETE_LOCAL_CHAT",
          postId: row.postId,
          chatId: row.chatId,
        });
      }
    },
    [dispatch, screen, currentGChatId, goToHref],
  );

  const renameRecentNote = useCallback(
    (row: RecentNoteRow, title: string) => {
      if (row.kind === "global") {
        const n = domain.globalNotes.find((x) => x.id === row.id);
        if (!n) return;
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, title } });
      } else {
        dispatch({
          type: "UPDATE_POST_NOTE",
          postId: row.postId,
          noteId: row.noteId,
          patch: { title },
        });
      }
    },
    [dispatch, domain.globalNotes],
  );

  const deleteRecentNote = useCallback(
    (row: RecentNoteRow) => {
      if (row.kind === "global") {
        dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: row.id });
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === row.id) {
          goToHref(routes.notes(), { replace: true });
        }
      } else {
        dispatch({ type: "DELETE_POST_NOTE", postId: row.postId, noteId: row.noteId });
        const cur = currentNote;
        if (
          screen === "note" &&
          cur &&
          cur.isGlobal === false &&
          cur.postId === row.postId &&
          cur.id === row.noteId
        ) {
          goToHref(routes.notes(), { replace: true });
        }
      }
    },
    [dispatch, screen, currentNote, goToHref],
  );

  return {
    screen,
    route,
    domain,
    dispatch,
    goHome,
    navigate,
    openPost,
    openGChat,
    chatsExpanded,
    setChatsExpanded,
    notesExpanded,
    setNotesExpanded,
    recentMenuOpenKey,
    setRecentMenuOpenKey,
    recentNotesMenuOpenKey,
    setRecentNotesMenuOpenKey,
    feedPostMenuOpen,
    setFeedPostMenuOpen,
    railAllowed,
    railActive,
    setSidebarCollapsed,
    recentChatsModel,
    recentNotesModel,
    currentPostSidebar,
    showFeedPostRow,
    isSidebarPostFullActive,
    isSidebarPostSubActive,
    feedPostCtxItems,
    scheduleModal,
    openNotesNav,
    openChatsNav,
    openLocalChat,
    isRecentChatActive,
    openNoteFromRow,
    isRecentNoteActive,
    renameRecentChat,
    deleteRecentChat,
    renameRecentNote,
    deleteRecentNote,
  };
}
