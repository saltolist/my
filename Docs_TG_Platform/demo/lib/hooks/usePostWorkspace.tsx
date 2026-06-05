"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { postById, useDomain } from "@/state/domain-store";
import { useComposer } from "@/state/composer-store";
import { useNavigation } from "@/state/navigation-store";
import type { NavigationPatch } from "@/state/navigation/types";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import { usePostCtxMenuItems } from "@/components/post/postCtxMenu";
import { useFeedPostLayout } from "@/lib/hooks/useFeedPostLayout";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePostHeaderCompact1200 } from "@/lib/hooks/usePostHeaderCompact1200";
import { useCompactHeader1000 } from "@/lib/hooks/useCompactHeader1000";
import { usePostScreenHeader } from "@/lib/hooks/usePostScreenHeader";
import { routes } from "@/lib/routes";
import type { LocalChat, LocalNote, Post, PostMedia, PostMode, NoteListFilter } from "@/lib/types";

export function usePostWorkspace() {
  const { state: domain, dispatch } = useDomain();
  const {
    currentPostId,
    currentPostChatId,
    postMode,
    isEditing,
    navigate,
    navigateBack,
    setPostView,
    goToHref,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    navDispatch,
  } = useNavigation();
  const { sendPost } = useComposer();

  const patchNav = useCallback(
    (patch: NavigationPatch) => navDispatch({ type: "SET_NAV", patch }),
    [navDispatch],
  );

  const post = postById(domain, currentPostId);
  const isMobile = useMobile760();
  const postHeaderCompact = usePostHeaderCompact1200();
  const postHeaderCompact1000 = useCompactHeader1000();
  const { phoneFormat, layoutClassName, layoutStyle } = useFeedPostLayout();
  const { items: ctxItems, modal: ctxModal } = usePostCtxMenuItems(post);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);

  const [listSearch, setListSearch] = useState("");
  const [listContextFilter, setListContextFilter] = useState<NoteListFilter>("all");

  const mediaItems: PostMedia[] = post?.media ?? [];
  const activeChat: LocalChat | null =
    post?.chats.find((c) => c.id === currentPostChatId) ?? null;
  const chatHistory = activeChat?.history;
  const flatMessages = useMemo(
    () => flattenVisibleWithPaths(chatHistory ?? []),
    [chatHistory],
  );
  const lastAssistantFlat = useMemo(
    () => lastAssistantFlatIndex(flatMessages),
    [flatMessages],
  );

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
    () => applyPostView("chat", currentPostChatId),
    [applyPostView, currentPostChatId],
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
    patchNav({
      postMode: "chat",
      currentPostChatId: null,
      postViewStack: [],
      isEditing: false,
    });
  }, [confirmDiscardAnyEdit, discardPendingEdits, patchNav]);

  const postHeader = usePostScreenHeader({
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
  });

  const startEdit = useCallback(() => {
    patchNav({ isEditing: true });
  }, [patchNav]);

  const cancelEdit = useCallback(() => {
    patchNav({ isEditing: false });
  }, [patchNav]);

  const savePost = useCallback(
    (text: string, media: PostMedia[]) => {
      if (!post) return;
      dispatch({
        type: "UPDATE_POST",
        postId: post.id,
        patch: { text, media: media.length > 0 ? [...media] : undefined },
      });
      patchNav({ isEditing: false });
    },
    [dispatch, patchNav, post],
  );

  const openComments = useCallback(
    () => applyPostView("comments", null),
    [applyPostView],
  );

  const openNote = useCallback(
    (note: LocalNote) => {
      if (!post) return;
      goToHref(routes.notePost(post.id, note.id));
    },
    [goToHref, post],
  );

  const toggleNoteAi = useCallback(
    (noteId: number) => {
      if (!post) return;
      dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: post.id, noteId });
    },
    [dispatch, post],
  );

  useEffect(() => {
    if (postMode === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [flatMessages.length, postMode]);

  useEffect(() => {
    setListContextFilter("all");
  }, [post?.id]);

  return {
    post,
    postMode,
    isEditing,
    currentPostChatId,
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
    ctxItems,
    ctxModal,
    isMobile,
    postHeaderCompact,
    postHeaderCompact1000,
    postHeader,
    chatScrollRef,
    postCardRef,
    navigate,
    navigateBack,
    goToPostNotes,
    goToPostChats,
    openPostView,
    openLocalChat,
    startNewChat,
    startNewNote,
    handleBack,
    scrollToPost: postHeader.scrollToPost,
    resetToPostChatRoot,
    startEdit,
    cancelEdit,
    savePost,
    openComments,
    openNote,
    toggleNoteAi,
    sendPost,
  };
}

export type PostWorkspace = ReturnType<typeof usePostWorkspace>;

export type PostWorkspaceRefs = {
  chatScrollRef: RefObject<HTMLDivElement | null>;
  postCardRef: RefObject<HTMLDivElement | null>;
};
