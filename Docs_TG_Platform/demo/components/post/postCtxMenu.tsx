"use client";

import { useMemo } from "react";
import type { CtxMenuItem } from "@/components/ContextMenu";
import {
  MenuIconCancel,
  MenuIconClock,
  MenuIconPlus,
  MenuIconPublish,
  MenuIconTrash,
} from "@/components/HeaderMenuIcons";
import { formatPostDateTime, postTitle } from "@/lib/helpers";
import { createNewPostNote, EMPTY_NOTE_SNAPSHOT } from "@/lib/noteDraft";
import type { Post, PostMode } from "@/lib/types";
import { useApp } from "@/state/AppContext";

type PostCtxHandlers = {
  onNewChat: () => void;
  onNewNote: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelPublish: () => void;
  onDelete: () => void;
};

function buildPostCtxMenuItems(post: Post, handlers: PostCtxHandlers): CtxMenuItem[] {
  const items: CtxMenuItem[] = [
    { label: "Новый чат", icon: <MenuIconPlus />, onClick: handlers.onNewChat },
    { label: "Новая заметка", icon: <MenuIconPlus />, onClick: handlers.onNewNote },
  ];
  if (post.status === "draft") {
    items.push(
      { label: "Опубликовать", icon: <MenuIconPublish />, onClick: handlers.onPublish },
      { label: "Запланировать", icon: <MenuIconClock />, onClick: handlers.onSchedule },
    );
  }
  if (post.status === "scheduled") {
    items.push(
      { label: "Опубликовать", icon: <MenuIconPublish />, onClick: handlers.onPublish },
      { label: "Отменить публикацию", icon: <MenuIconCancel />, onClick: handlers.onCancelPublish },
    );
  }
  items.push({
    label: "Удалить",
    icon: <MenuIconTrash />,
    danger: true,
    onClick: handlers.onDelete,
  });
  return items;
}

/** Пункты меню ••• поста (шапка поста и строка поста в сайдбаре). */
export function usePostCtxMenuItems(post: Post | null | undefined): CtxMenuItem[] {
  const {
    state,
    dispatch,
    navigate,
    navigateWithState,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    canLeaveCurrentScreen,
  } = useApp();

  return useMemo(() => {
    if (!post) return [];

    const pushPostView = (nextMode: PostMode, nextChatId: number | null) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      if (
        state.screen === "post" &&
        state.currentPostId === post.id &&
        state.postMode === nextMode &&
        state.currentPostChatId === nextChatId
      ) {
        return;
      }
      const stack =
        state.screen === "post" && state.currentPostId === post.id
          ? [...state.postViewStack, { mode: state.postMode, chatId: state.currentPostChatId }]
          : [];
      navigateWithState({
        screen: "post",
        currentPostId: post.id,
        currentPostChatId: nextChatId,
        postMode: nextMode,
        postViewStack: stack,
        isEditing: false,
      });
    };

    return buildPostCtxMenuItems(post, {
      onNewChat: () => pushPostView("chat", null),
      onNewNote: () => {
        if (!canLeaveCurrentScreen("note")) return;
        navigateWithState({
          screen: "note",
          currentPostId: post.id,
          currentNote: createNewPostNote(post.id),
          noteFrom: "post",
          noteMode: "edit",
          noteSavedSnapshot: EMPTY_NOTE_SNAPSHOT,
        });
      },
      onPublish: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: {
            status: "published",
            date: formatPostDateTime(),
            metrics: { views: "0", reposts: 0, reactions: [] },
          },
        }),
      onSchedule: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: { status: "scheduled", date: "10 мая 20:00" },
        }),
      onCancelPublish: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: { status: "draft", created: "сейчас" },
        }),
      onDelete: () => {
        if (!confirm(`Удалить пост «${postTitle(post)}»?`)) return;
        dispatch({ type: "DELETE_POST", postId: post.id });
        navigate("feed", { skipHistory: true, clearHistory: true });
      },
    });
  }, [
    post,
    state.screen,
    state.currentPostId,
    state.postMode,
    state.currentPostChatId,
    state.postViewStack,
    dispatch,
    navigate,
    navigateWithState,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    canLeaveCurrentScreen,
  ]);
}
