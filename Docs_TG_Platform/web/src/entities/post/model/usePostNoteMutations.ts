"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getCachedPost, setCachedPost } from "@/entities/post/lib/getCachedPost";
import type { LocalNote } from "@/shared/types";

import { useUpdatePost } from "./usePosts";

export function useAddPostNote() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, note: LocalNote) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const notes = [...(post.notes ?? []), note];
      const updated = { ...post, notes };
      await updatePost.mutateAsync({ id: postId, patch: { notes } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function useUpdatePostNote() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, noteId: number, patch: Partial<LocalNote>) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const notes = (post.notes ?? []).map((n) => (n.id === noteId ? { ...n, ...patch } : n));
      const updated = { ...post, notes };
      await updatePost.mutateAsync({ id: postId, patch: { notes } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function useDeletePostNote() {
  const updatePost = useUpdatePost();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, noteId: number) => {
      const post = getCachedPost(queryClient, postId);
      if (!post) return;
      const notes = (post.notes ?? []).filter((n) => n.id !== noteId);
      const updated = { ...post, notes };
      await updatePost.mutateAsync({ id: postId, patch: { notes } });
      setCachedPost(queryClient, updated);
    },
    [queryClient, updatePost],
  );
}

export function useTogglePostNoteAi() {
  const updatePostNote = useUpdatePostNote();
  const queryClient = useQueryClient();

  return useCallback(
    async (postId: number, noteId: number) => {
      const post = getCachedPost(queryClient, postId);
      const note = post?.notes?.find((n) => n.id === noteId);
      if (!note) return;
      await updatePostNote(postId, noteId, { ai: !note.ai });
    },
    [queryClient, updatePostNote],
  );
}
