"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { postTitle } from "@/shared/lib/helpers";
import { NavIconChats, NavIconFeed, NavIconNotes } from "@/widgets/sidebar";
import type { PageHeaderOverflowItem } from "@/widgets/page-header";
import type { CtxMenuItem } from "@/shared/ui/context-menu";
import {
  buildPostHeaderRightClassName,
  buildPostHeaderRootClassName,
  getPostListSearchPlaceholder,
  getPostSubPageLabel,
} from "@/shared/lib/post/postHeader";
import type { LocalChat, Post, PostMode } from "@/shared/types";

type Args = {
  post: Post | null;
  postMode: PostMode;
  currentPostChatId: number | null;
  activeChat: LocalChat | null;
  isEditing: boolean;
  isMobile: boolean;
  postHeaderCompact: boolean;
  postHeaderCompact1000: boolean;
  ctxItems: CtxMenuItem[];
  listSearch: string;
  setListSearch: (value: string) => void;
  chatScrollRef: RefObject<HTMLDivElement | null>;
  postCardRef: RefObject<HTMLDivElement | null>;
  openPostView: () => void;
  goToPostNotes: () => void;
  goToPostChats: () => void;
};

export function usePostScreenHeader({
  post,
  postMode,
  currentPostChatId,
  activeChat,
  isEditing,
  isMobile,
  postHeaderCompact,
  postHeaderCompact1000,
  ctxItems,
  listSearch,
  setListSearch,
  chatScrollRef,
  postCardRef,
  openPostView,
  goToPostNotes,
  goToPostChats,
}: Args) {
  const postHdrTopRef = useRef<HTMLDivElement>(null);
  const mobileSearchLeftRef = useRef<HTMLDivElement>(null);
  const postOverflowWrapRef = useRef<HTMLDivElement>(null);
  const postHeaderRightRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);

  const [showJump, setShowJump] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const scrollToPost = useCallback(() => {
    chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chatScrollRef]);

  const postSubPage = getPostSubPageLabel(postMode);
  const showListHeaderSearch = postSubPage != null;
  const listSearchPlaceholder = getPostListSearchPlaceholder(postMode);
  const postIntermediateCrumb = post ? postTitle(post) : "";

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [postMode, showListHeaderSearch]);

  useEffect(() => {
    if (postMode !== "chat") {
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
  }, [postMode, isEditing, post?.id, activeChat?.id, chatScrollRef, postCardRef]);

  const postHeaderOverflowItems = useMemo((): PageHeaderOverflowItem[] => {
    if (!post) return [];
    const items: PageHeaderOverflowItem[] = [];

    if (postMode === "chat" && showJump) {
      items.push({
        label: "↑ К посту",
        icon: <NavIconFeed />,
        onClick: scrollToPost,
      });
    }

    if (postMode !== "chat") {
      items.push({
        label: "К посту",
        onClick: openPostView,
        icon: <NavIconFeed />,
      });
    }

    items.push({
      label: "Заметки",
      onClick: goToPostNotes,
      active: postMode === "notes",
      icon: <NavIconNotes />,
    });
    items.push({
      label: "Чаты",
      onClick: goToPostChats,
      active: postMode === "chats",
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
    postMode,
  ]);

  const hasPostMobileTrailing = postHeaderOverflowItems.length > 0;

  useLayoutEffect(() => {
    if (!post || !mobileSearchOpen || !postHeaderCompact || !showListHeaderSearch) return;
    const header = postHdrTopRef.current;
    const left = mobileSearchLeftRef.current;
    const rightColumn = postHeaderRightRef.current;
    if (!header || !left || !rightColumn) return;

    const updateSearchSpan = () => {
      const headerRect = header.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      // Якорь справа — «•••», не начало колонки (там spacer под лупу).
      const rightAnchor = postOverflowWrapRef.current ?? rightColumn;
      const rightRect = rightAnchor.getBoundingClientRect();
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
    observer.observe(rightColumn);
    const overflowWrap = postOverflowWrapRef.current;
    if (overflowWrap) observer.observe(overflowWrap);
    window.addEventListener("resize", updateSearchSpan);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSearchSpan);
    };
  }, [post, mobileSearchOpen, postHeaderCompact, showListHeaderSearch, hasPostMobileTrailing]);

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

  const rootClassName = buildPostHeaderRootClassName({
    showListHeaderSearch,
    postHeaderCompact,
    mobileSearchOpen,
  });
  const rightClassName = buildPostHeaderRightClassName({
    showPostMobileRight,
    showPostTabletCompactRight,
    showPostTabletOverflow,
    showJump,
  });

  return {
    postSubPage,
    showListHeaderSearch,
    listSearchPlaceholder,
    postIntermediateCrumb,
    showJump,
    postHeaderOverflowItems,
    mobileSearchOpen,
    setMobileSearchOpen,
    showPostModeButtons,
    showPostMobileRight,
    showPostTabletOverflow,
    showPostTabletSearchToggle,
    showPostTabletCompactRight,
    hasPostMobileTrailing,
    postHdrTopRef,
    mobileSearchLeftRef,
    postOverflowWrapRef,
    postHeaderRightRef,
    mobileSearchInputRef,
    mobileSearchWrapRef,
    scrollToPost,
    rootClassName,
    rightClassName,
    listSearch,
    setListSearch,
    postMode,
    currentPostChatId,
    activeChat,
    postHeaderCompact,
  };
}

export type PostScreenHeaderState = ReturnType<typeof usePostScreenHeader>;
