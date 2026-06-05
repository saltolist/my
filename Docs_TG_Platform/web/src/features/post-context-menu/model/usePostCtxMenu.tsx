"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { CtxMenuItem } from "@/shared/ui/context-menu";
import {
  buildPostCtxMenuItems,
  getDefaultScheduleDate,
} from "@/features/post-context-menu/lib/buildItems";
import { SchedulePickerModal } from "@/features/schedule-post";
import { formatPostDateTime, parsePostDateTime, postTitle } from "@/shared/lib/helpers";
import { routes } from "@/shared/lib/routes";
import type { Post, PostMode } from "@/shared/types";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";

export type PostCtxMenuResult = {
  items: CtxMenuItem[];
  modal: ReactNode;
};

/** Пункты меню ••• поста (шапка поста и строка поста в сайдбаре). */
export function usePostCtxMenuItems(post: Post | null | undefined): PostCtxMenuResult {
  const { dispatch } = useDomain();
  const {
    goToHref,
    setPostView,
    confirmDiscardAnyEdit,
    discardPendingEdits,
  } = useNavigation();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState<Date>(() => getDefaultScheduleDate());

  const closeSchedule = useCallback(() => {
    setIsScheduleOpen(false);
  }, []);

  const openScheduleModal = useCallback((initial?: Date) => {
    setScheduleInitialDate(initial ?? getDefaultScheduleDate());
    setIsScheduleOpen(true);
  }, []);

  const confirmSchedule = useCallback(
    (value: string) => {
      if (!post) return;
      const selected = new Date(value);
      if (Number.isNaN(selected.getTime())) return;
      dispatch({
        type: "UPDATE_POST",
        postId: post.id,
        patch: {
          status: "scheduled",
          date: formatPostDateTime(selected),
        },
      });
      setIsScheduleOpen(false);
    },
    [dispatch, post],
  );

  useEffect(() => {
    if (!isScheduleOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsScheduleOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isScheduleOpen]);

  const items = useMemo(() => {
    if (!post) return [];

    const pushPostView = (nextMode: PostMode, nextChatId: number | null) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      setPostView(nextMode, nextChatId);
    };

    return buildPostCtxMenuItems(post, {
      onNewChat: () => pushPostView("chat", null),
      onNewNote: () => {
        goToHref(routes.noteNew("post", post.id));
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
      onSchedule: () => openScheduleModal(),
      onReschedule: () =>
        openScheduleModal(parsePostDateTime(post.date) ?? getDefaultScheduleDate()),
      onCancelPublish: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: { status: "draft", created: "сейчас" },
        }),
      onDelete: () => {
        if (!confirm(`Удалить пост «${postTitle(post)}»?`)) return;
        dispatch({ type: "DELETE_POST", postId: post.id });
        goToHref(routes.feed(), { replace: true });
      },
    });
  }, [
    post,
    dispatch,
    goToHref,
    setPostView,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    openScheduleModal,
  ]);

  const modal =
    isScheduleOpen && typeof document !== "undefined"
      ? createPortal(
          <SchedulePickerModal
            key={scheduleInitialDate.getTime()}
            initialDate={scheduleInitialDate}
            plannedDate={
              post?.status === "scheduled" ? parsePostDateTime(post.date) : null
            }
            onClose={closeSchedule}
            onConfirm={confirmSchedule}
          />,
          document.body,
        )
      : null;

  return { items, modal };
}
