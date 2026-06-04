"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { postById, useApp } from "@/state/AppContext";
import { postTitle } from "@/lib/helpers";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import { usePostCtxMenuItems } from "@/components/post/postCtxMenu";
import { NavIconChats, NavIconFeed, NavIconNotes } from "@/components/sidebar/NavIcons";
import { useFeedPostLayout } from "@/lib/hooks/useFeedPostLayout";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePostHeaderCompact1200 } from "@/lib/hooks/usePostHeaderCompact1200";
import { useCompactHeader1000 } from "@/lib/hooks/useCompactHeader1000";
import { routes } from "@/lib/routes";
import type { PageHeaderOverflowItem } from "@/components/PageHeaderOverflow";
import type { LocalChat, Post, PostMedia, PostMode, NoteListFilter } from "@/lib/types";

export function usePostWorkspace() {
  const {
    state,
    dispatch,
    navigate,
    navigateBack,
    setPostView,
    goToHref,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    sendPost,
  } = useApp();

  const post = postById(state, state.currentPostId);
  const isMobile = useMobile760();
  const postHeaderCompact = usePostHeaderCompact1200();
  const postHeaderCompact1000 = useCompactHeader1000();
  const { phoneFormat, layoutClassName, layoutStyle } = useFeedPostLayout();
  const { items: ctxItems, modal: ctxModal } = usePostCtxMenuItems(post);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);
  const postHdrTopRef = useRef<HTMLDivElement>(null);
  const mobileSearchLeftRef = useRef<HTMLDivElement>(null);
  const postOverflowWrapRef = useRef<HTMLDivElement>(null);
  const postHeaderRightRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);

  const [showJump, setShowJump] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [listContextFilter, setListContextFilter] = useState<NoteListFilter>("all");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const mediaItems: PostMedia[] = post?.media ?? [];
  const activeChat: LocalChat | null =
    post?.chats.find((c) => c.id === state.currentPostChatId) ?? null;
  const chatHistory = activeChat?.history;
  const flatMessages = useMemo(
    () => flattenVisibleWithPaths(chatHistory ?? []),
    [chatHistory],
  );
  const lastAssistantFlat = useMemo(
    () => lastAssistantFlatIndex(flatMessages),
    [flatMessages],
  );

  const scrollToPost = useCallback(() => {
    chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const applyPostView = useCallback(
    (nextMode: PostMode, nextChatId: number | null = null) => {
      if (!post) return;
      setPostView(nextMode, nextChatId);
      setListSearch("");
    },
    [post, setPostView],
  );

  const goToPostNotes = useCallback(() => applyPostView("notes", null), [applyPostView]);
  const goToPostChats = useCallback(() => applyPostView("chats", null), [applyPostView]);
  const openPostView = useCallback(
    () => applyPostView("chat", state.currentPostChatId),
    [applyPostView, state.currentPostChatId],
  );
  const openLocalChat = useCallback(
    (chatId: number) => applyPostView("chat", chatId),
    [applyPostView],
  );
  const startNewChat = useCallback(() => applyPostView("chat", null), [applyPostView]);
  const startNewNote = useCallback(() => {
    if (!post) return;
    goToHref(routes.noteNew("post", post.id));
  }, [goToHref, post]);
  const handleBack = useCallback(() => navigateBack("feed"), [navigateBack]);

  const resetToPostChatRoot = useCallback(() => {
    if (!confirmDiscardAnyEdit()) return;
    discardPendingEdits();
    dispatch({
      type: "SET_STATE",
      patch: {
        postMode: "chat",
        currentPostChatId: null,
        postViewStack: [],
        isEditing: false,
      },
    });
  }, [confirmDiscardAnyEdit, discardPendingEdits, dispatch]);

  const startEdit = useCallback(() => {
    dispatch({ type: "SET_STATE", patch: { isEditing: true } });
  }, [dispatch]);

  const cancelEdit = useCallback(() => {
    dispatch({ type: "SET_STATE", patch: { isEditing: false } });
  }, [dispatch]);

  const savePost = useCallback(
    (text: string, media: PostMedia[]) => {
      if (!post) return;
      dispatch({
        type: "UPDATE_POST",
        postId: post.id,
        patch: { text, media: media.length > 0 ? [...media] : undefined },
      });
      dispatch({ type: "SET_STATE", patch: { isEditing: false } });
    },
    [dispatch, post],
  );

  const openComments = useCallback(
    () => applyPostView("comments", null),
    [applyPostView],
  );

  useEffect(() => {
    if (state.postMode === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [flatMessages.length, state.postMode]);

  useEffect(() => {
    if (state.postMode !== "chat") {
      setShowJump(false);
      return;
    }
    const sync = () => {
      if (!chatScrollRef.current || !postCardRef.current) return;
      const hdr = chatScrollRef.current
        .closest(".screen")
        ?.querySelector<HTMLElement>(".post-hdr");
      const revealLine =
        hdr?.getBoundingClientRect().bottom ??
        chatScrollRef.current.getBoundingClientRect().top;
      const cr = postCardRef.current.getBoundingClientRect();
      setShowJump(cr.bottom < revealLine + 4);
    };
    sync();
    const el = chatScrollRef.current;
    el?.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [state.postMode, state.isEditing, post?.id, activeChat?.id]);

  const postSubPage =
    state.postMode === "comments"
      ? "Комментарии"
      : state.postMode === "notes"
        ? "Заметки"
        : state.postMode === "chats"
          ? "Чаты"
          : null;
  const showListHeaderSearch = postSubPage != null;

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [state.postMode, showListHeaderSearch]);

  useEffect(() => {
    setListContextFilter("all");
  }, [post?.id]);

  const postHeaderOverflowItems = useMemo((): PageHeaderOverflowItem[] => {
    if (!post) return [];
    const items: PageHeaderOverflowItem[] = [];

    if (state.postMode === "chat" && showJump) {
      items.push({
        label: "↑ К посту",
        icon: <NavIconFeed />,
        onClick: scrollToPost,
      });
    }

    if (state.postMode !== "chat") {
      items.push({
        label: "К посту",
        onClick: openPostView,
        icon: <NavIconFeed />,
      });
    }

    items.push({
      label: "Заметки",
      onClick: goToPostNotes,
      active: state.postMode === "notes",
      icon: <NavIconNotes />,
    });
    items.push({
      label: "Чаты",
      onClick: goToPostChats,
      active: state.postMode === "chats",
      icon: <NavIconChats />,
    });

    return [
      ...items,
      ...ctxItems.map((item) => ({
        label: item.label,
        onClick: item.onClick,
        icon: item.icon,
        danger: item.danger,
        disabled: item.disabled,
      })),
    ];
  }, [
    ctxItems,
    goToPostChats,
    goToPostNotes,
    openPostView,
    post,
    scrollToPost,
    showJump,
    state.postMode,
  ]);

  const hasPostMobileTrailing = postHeaderOverflowItems.length > 0;

  useLayoutEffect(() => {
    if (!post || !mobileSearchOpen || !postHeaderCompact || !showListHeaderSearch) return;
    const header = postHdrTopRef.current;
    const left = mobileSearchLeftRef.current;
    const right = postHeaderRightRef.current;
    if (!header || !left || !right) return;

    const updateSearchSpan = () => {
      const headerRect = header.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      header.style.setProperty(
        "--page-header-search-span-left",
        `${leftRect.right - headerRect.left}px`,
      );
      header.style.setProperty(
        "--page-header-search-span-right",
        `${headerRect.right - rightRect.left}px`,
      );
    };

    updateSearchSpan();
    const observer = new ResizeObserver(updateSearchSpan);
    observer.observe(header);
    observer.observe(left);
    observer.observe(right);
    window.addEventListener("resize", updateSearchSpan);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSearchSpan);
    };
  }, [post, mobileSearchOpen, postHeaderCompact, showListHeaderSearch]);

  const listSearchPlaceholder =
    state.postMode === "comments"
      ? "Поиск по комментариям..."
      : state.postMode === "notes"
        ? "Поиск по заметкам..."
        : "Поиск по чатам...";

  const postIntermediateCrumb = post ? postTitle(post) : "";
  const showPostModeButtons = !postHeaderCompact1000;
  const showPostMobileRight =
    isMobile &&
    ((showListHeaderSearch && !mobileSearchOpen) ||
      hasPostMobileTrailing ||
      (mobileSearchOpen && hasPostMobileTrailing));
  const showPostTabletOverflow =
    postHeaderCompact1000 && !isMobile && hasPostMobileTrailing;
  const showPostTabletSearchToggle =
    postHeaderCompact && !isMobile && showListHeaderSearch && !mobileSearchOpen;
  const showPostTabletCompactRight =
    postHeaderCompact && !isMobile && showListHeaderSearch;

  return {
    post,
    postMode: state.postMode,
    isEditing: state.isEditing,
    currentPostChatId: state.currentPostChatId,
    activeChat,
    flatMessages,
    lastAssistantFlat,
    mediaItems,
    phoneFormat,
    layoutClassName,
    layoutStyle,
    listSearch,
    setListSearch,
    listContextFilter,
    setListContextFilter,
    mobileSearchOpen,
    setMobileSearchOpen,
    postSubPage,
    showListHeaderSearch,
    listSearchPlaceholder,
    postIntermediateCrumb,
    showJump,
    postHeaderOverflowItems,
    ctxItems,
    ctxModal,
    isMobile,
    postHeaderCompact,
    postHeaderCompact1000,
    showPostModeButtons,
    showPostMobileRight,
    showPostTabletOverflow,
    showPostTabletSearchToggle,
    showPostTabletCompactRight,
    hasPostMobileTrailing,
    chatScrollRef,
    postCardRef,
    postHdrTopRef,
    mobileSearchLeftRef,
    postOverflowWrapRef,
    postHeaderRightRef,
    mobileSearchInputRef,
    mobileSearchWrapRef,
    navigate,
    navigateBack,
    goToPostNotes,
    goToPostChats,
    openPostView,
    openLocalChat,
    startNewChat,
    startNewNote,
    handleBack,
    scrollToPost,
    resetToPostChatRoot,
    startEdit,
    cancelEdit,
    savePost,
    openComments,
    sendPost,
  };
}

export type PostWorkspace = ReturnType<typeof usePostWorkspace>;

export type PostWorkspaceRefs = {
  chatScrollRef: RefObject<HTMLDivElement | null>;
  postCardRef: RefObject<HTMLDivElement | null>;
  postHdrTopRef: RefObject<HTMLDivElement | null>;
  mobileSearchLeftRef: RefObject<HTMLDivElement | null>;
  postOverflowWrapRef: RefObject<HTMLDivElement | null>;
  postHeaderRightRef: RefObject<HTMLDivElement | null>;
  mobileSearchInputRef: RefObject<HTMLInputElement | null>;
  mobileSearchWrapRef: RefObject<HTMLDivElement | null>;
};
