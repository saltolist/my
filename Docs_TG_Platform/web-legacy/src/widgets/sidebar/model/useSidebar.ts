"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { usePostCtxMenuItems } from "@/features/post-context-menu";
import { buildRecentChatsModel, buildRecentNotesModel } from "@/widgets/sidebar/lib/buildRecentModels";
import { RAIL_MQ, SIDEBAR_COLLAPSED_KEY } from "@/widgets/sidebar/model/types";
import { parseAppPath, routes, screenFromPath } from "@/shared/lib/routes";
import {
  domainActions,
  selectGlobalNotes,
  selectPosts,
  selectSidebarDomain,
  useDomainDispatch,
  useDomainSelector,
  useNavigation,
} from "@/app/model/store";
import type { DomainState } from "@/app/model/store/domain/types";
import type { RecentNoteRow, RecentRow } from "@/widgets/sidebar/model/types";

const sidebarDomainEqual = (
  a: ReturnType<typeof selectSidebarDomain>,
  b: ReturnType<typeof selectSidebarDomain>,
) => a.posts === b.posts && a.globalChats === b.globalChats && a.globalNotes === b.globalNotes;

export function useSidebar() {
  const sidebarDomain = useDomainSelector(selectSidebarDomain, sidebarDomainEqual);
  const posts = useDomainSelector(selectPosts);
  const globalNotes = useDomainSelector(selectGlobalNotes);
  const dispatch = useDomainDispatch();
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
    () => buildRecentChatsModel(sidebarDomain as DomainState, sidebarPostId),
    [sidebarDomain, sidebarPostId],
  );

  const recentNotesModel = useMemo(
    () => buildRecentNotesModel(sidebarDomain as DomainState, sidebarPostId),
    [sidebarDomain, sidebarPostId],
  );

  const currentPostSidebar = useMemo(() => {
    if (sidebarPostId == null) return null;
    return posts.find((p) => p.id === sidebarPostId) ?? null;
  }, [sidebarPostId, posts]);

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
        const n = globalNotes.find((x) => x.id === row.id);
        if (!n) return;
        goToHref(routes.noteGlobal(row.id));
      } else {
        const post = posts.find((p) => p.id === row.postId);
        const n = post?.notes.find((x) => x.id === row.noteId);
        if (!n || !post) return;
        goToHref(routes.notePost(row.postId, row.noteId));
      }
    },
    [globalNotes, posts, goToHref],
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
        dispatch(domainActions.renameGlobalChat(row.id, title));
      } else {
        dispatch(domainActions.renameLocalChat(row.postId, row.chatId, title));
      }
    },
    [dispatch],
  );

  const deleteRecentChat = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global") {
        dispatch(domainActions.deleteGlobalChat(row.id));
        if (screen === "gchat" && currentGChatId === row.id) {
          goToHref(routes.chats(), { replace: true });
        }
      } else {
        dispatch(domainActions.deleteLocalChat(row.postId, row.chatId));
      }
    },
    [dispatch, screen, currentGChatId, goToHref],
  );

  const renameRecentNote = useCallback(
    (row: RecentNoteRow, title: string) => {
      if (row.kind === "global") {
        const n = globalNotes.find((x) => x.id === row.id);
        if (!n) return;
        dispatch(domainActions.upsertGlobalNote({ ...n, title }));
      } else {
        dispatch(domainActions.updatePostNote(row.postId, row.noteId, { title }));
      }
    },
    [dispatch, globalNotes],
  );

  const deleteRecentNote = useCallback(
    (row: RecentNoteRow) => {
      if (row.kind === "global") {
        dispatch(domainActions.deleteGlobalNote(row.id));
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === row.id) {
          goToHref(routes.notes(), { replace: true });
        }
      } else {
        dispatch(domainActions.deletePostNote(row.postId, row.noteId));
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
