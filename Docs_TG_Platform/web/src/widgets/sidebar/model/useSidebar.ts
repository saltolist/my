"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigationStore } from "@/app/model/store/navigation-store";
import { useUiStore } from "@/app/model/store";
import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import {
  useDeleteGlobalChat,
  useGlobalChats,
  useRenameGlobalChat,
} from "@/entities/chat";
import { useGlobalNotes, useDeleteGlobalNote, useUpsertGlobalNote } from "@/entities/note";
import {
  useDeleteLocalChat,
  useDeletePostNote,
  usePosts,
  useRenameLocalChat,
  useUpdatePostNote,
} from "@/entities/post";
import { usePostCtxMenuItems } from "@/features/post-context-menu";
import { RAIL_MIN_MQ, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import {
  parseAppPath,
  parseChatSearchParam,
  parseGChatSearchParam,
  routes,
  screenFromPath,
} from "@/shared/lib/routes";
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
  const searchParams = useSearchParams();
  const route = parseAppPath(pathname);
  const screen = screenFromPath(pathname);
  const gchatIdFromUrl = parseGChatSearchParam(searchParams.get("id"));
  const postChatIdFromUrl = parseChatSearchParam(searchParams.get("chat"));

  const railAllowed = useMediaQuery(RAIL_MIN_MQ);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const setPostMode = usePostNavigationStore((s) => s.setMode);
  const currentNote = useNavigationStore((s) => s.currentNote);
  const noteFrom = useNavigationStore((s) => s.noteFrom);

  const { data: posts = [] } = usePosts();
  const { data: globalChats = [] } = useGlobalChats();
  const { data: globalNotes = [] } = useGlobalNotes();
  const renameGlobalChat = useRenameGlobalChat();
  const deleteGlobalChat = useDeleteGlobalChat();
  const renameLocalChat = useRenameLocalChat();
  const deleteLocalChat = useDeleteLocalChat();
  const upsertGlobalNote = useUpsertGlobalNote();
  const updatePostNote = useUpdatePostNote();
  const deleteGlobalNote = useDeleteGlobalNote();
  const deletePostNote = useDeletePostNote();

  const [notesExpanded, setNotesExpanded] = useState(false);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [recentMenuOpenKey, setRecentMenuOpenKey] = useState<string | null>(null);
  const [recentNotesMenuOpenKey, setRecentNotesMenuOpenKey] = useState<string | null>(null);
  const [feedPostMenuOpen, setFeedPostMenuOpen] = useState(false);

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
    sidebarPostId != null &&
    (screen === "post" ||
      (screen === "note" && currentNote != null && currentNote.isGlobal === false));

  const isSidebarPostFullActive =
    sidebarPostId != null &&
    screen === "post" &&
    route.postId === sidebarPostId &&
    postChatIdFromUrl == null;

  const isSidebarPostSubActive =
    sidebarPostId != null &&
    !isSidebarPostFullActive &&
    ((screen === "post" &&
      route.postId === sidebarPostId &&
      postChatIdFromUrl != null) ||
      (screen === "note" &&
        currentNote != null &&
        currentNote.isGlobal === false &&
        currentNote.postId === sidebarPostId));

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
      setPostMode(postId, "chat");
      goTo(routes.post(postId));
    },
    [goTo, setPostMode],
  );

  const startPostNewChat = useCallback(() => {
    if (sidebarPostId == null) return;
    setPostMode(sidebarPostId, "chat", null);
    goTo(routes.post(sidebarPostId));
  }, [goTo, setPostMode, sidebarPostId]);

  const startPostNewNote = useCallback(() => {
    if (sidebarPostId == null) return;
    goTo(routes.noteNew("post", sidebarPostId));
  }, [goTo, sidebarPostId]);

  const { items: feedPostCtxItems, modal: scheduleModal } = usePostCtxMenuItems(
    currentPostSidebar,
    {
      onNewChat: startPostNewChat,
      onNewNote: startPostNewNote,
    },
  );

  const renameRecentChat = useCallback(
    (row: RecentRow, title: string) => {
      if (row.kind === "global") {
        void renameGlobalChat.mutateAsync({ chatId: row.id, title });
        return;
      }
      void renameLocalChat(row.postId, row.chatId, title);
    },
    [renameGlobalChat, renameLocalChat],
  );

  const deleteRecentChat = useCallback(
    (row: RecentRow) => {
      if (row.kind === "global") {
        void deleteGlobalChat.mutateAsync(row.id);
        if (screen === "gchat" && gchatIdFromUrl === row.id) {
          router.replace(routes.chats());
        }
        return;
      }
      void deleteLocalChat(row.postId, row.chatId);
    },
    [deleteGlobalChat, deleteLocalChat, gchatIdFromUrl, router, screen],
  );

  const renameRecentNote = useCallback(
    (row: RecentNoteRow, title: string) => {
      if (row.kind === "global") {
        const note = globalNotes.find((n) => n.id === row.id);
        if (!note) return;
        void upsertGlobalNote.mutateAsync({ ...note, title });
        return;
      }
      void updatePostNote(row.postId, row.noteId, { title });
    },
    [globalNotes, updatePostNote, upsertGlobalNote],
  );

  const deleteRecentNote = useCallback(
    (row: RecentNoteRow) => {
      if (row.kind === "global") {
        void deleteGlobalNote.mutateAsync(row.id);
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === row.id) {
          router.replace(routes.notes());
        }
        return;
      }
      void deletePostNote(row.postId, row.noteId);
      const cur = currentNote;
      if (
        screen === "note" &&
        cur &&
        cur.isGlobal === false &&
        cur.postId === row.postId &&
        cur.id === row.noteId
      ) {
        router.replace(noteFrom === "post" ? routes.post(row.postId) : routes.notes());
      }
    },
    [currentNote, deleteGlobalNote, deletePostNote, noteFrom, router, screen],
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
      setPostMode(row.postId, "chat", row.chatId);
      goTo(routes.post(row.postId, row.chatId));
    },
    [goTo, setPostMode],
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
        return screen === "gchat" && gchatIdFromUrl === row.id;
      }
      return (
        screen === "post" &&
        route.postId === row.postId &&
        postChatIdFromUrl === row.chatId
      );
    },
    [screen, route.postId, gchatIdFromUrl, postChatIdFromUrl],
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
    feedPostCtxItems,
    feedPostMenuOpen,
    setFeedPostMenuOpen,
    scheduleModal,
    recentMenuOpenKey,
    setRecentMenuOpenKey,
    recentNotesMenuOpenKey,
    setRecentNotesMenuOpenKey,
    renameRecentChat,
    deleteRecentChat,
    renameRecentNote,
    deleteRecentNote,
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
