"use client";

import { useCallback } from "react";

import { useDeletePost, useUpdatePost } from "@/entities/post/model/usePosts";
import { postTitle } from "@/shared/lib/postTitle";
import type { Post, PostMedia } from "@/shared/types";

function formatNow(): string {
  const d = new Date();
  const months = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

type UsePostWorkspaceActionsArgs = {
  post: Post | undefined;
  editText: string;
  editMedia: PostMedia[];
  onSaved?: () => void;
  onDeleted?: () => void;
};

export function usePostWorkspaceActions({
  post,
  editText,
  editMedia,
  onSaved,
  onDeleted,
}: UsePostWorkspaceActionsArgs) {
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const handleSavePost = useCallback(async () => {
    if (!post) return;
    await updatePost.mutateAsync({
      id: post.id,
      patch: {
        text: editText,
        media: editMedia.length > 0 ? editMedia : undefined,
      },
    });
    onSaved?.();
  }, [editMedia, editText, onSaved, post, updatePost]);

  const handlePublish = useCallback(async () => {
    if (!post) return;
    await updatePost.mutateAsync({
      id: post.id,
      patch: {
        status: "published",
        date: formatNow(),
        metrics: { views: "0", reposts: 0, reactions: [] },
      },
    });
  }, [post, updatePost]);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    if (!window.confirm(`Удалить пост «${postTitle(post)}»?`)) return;
    await deletePost.mutateAsync(post.id);
    onDeleted?.();
  }, [deletePost, onDeleted, post]);

  const handleToggleNoteAi = useCallback(
    async (noteId: number) => {
      if (!post) return;
      const notes = post.notes.map((n) =>
        n.id === noteId ? { ...n, ai: !n.ai } : n,
      );
      await updatePost.mutateAsync({ id: post.id, patch: { notes } });
    },
    [post, updatePost],
  );

  return {
    handleSavePost,
    handlePublish,
    handleDelete,
    handleToggleNoteAi,
  };
}
