"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { postTitle } from "@/shared/lib/helpers";
import { NavIconChats, NavIconFeed, NavIconNotes } from "@/widgets/sidebar";
import type { PageHeaderOverflowItem } from "@/widgets/page-header";
import type { CtxMenuItem } from "@/shared/ui/context-menu";
import { getPostListSearchPlaceholder, getPostSubPageLabel } from "@/shared/lib/post/postHeader";
import type { LocalChat, Post, PostMode } from "@/shared/types";

type Args = {
  post: Post | null;
  postMode: PostMode;
  currentPostChatId: number | null;
  activeChat: LocalChat | null;
  isEditing: boolean;
  isMobile: boolean;
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
  const [showJump, setShowJump] = useState(false);

  const scrollToPost = useCallback(() => {
    chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chatScrollRef]);

  const postSubPage = getPostSubPageLabel(postMode);
  const showListHeaderSearch = postSubPage != null;
  const listSearchPlaceholder = getPostListSearchPlaceholder(postMode);
  const postIntermediateCrumb = post ? postTitle(post) : "";

  useEffect(() => {
    if (postMode !== "chat") {
      setShowJump(false);
      return;
    }
    const sync = () => {
      if (!chatScrollRef.current || !postCardRef.current) return;
      const hdr = chatScrollRef.current
        .closest(".screen")
        ?.querySelector<HTMLElement>(".page-header--post");
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

  const showPostModeButtons = !postHeaderCompact1000;
  const showPostTabletOverflow =
    postHeaderCompact1000 && !isMobile && postHeaderOverflowItems.length > 0;

  return {
    postSubPage,
    showListHeaderSearch,
    listSearchPlaceholder,
    postIntermediateCrumb,
    showJump,
    postHeaderOverflowItems,
    showPostModeButtons,
    showPostTabletOverflow,
    scrollToPost,
    listSearch,
    setListSearch,
    postMode,
    currentPostChatId,
    activeChat,
  };
}

export type PostScreenHeaderState = ReturnType<typeof usePostScreenHeader>;
