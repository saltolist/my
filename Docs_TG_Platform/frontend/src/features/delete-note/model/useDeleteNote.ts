"use client";

import { useMutation } from "@tanstack/react-query";
import { useDeleteGlobalNote } from "@/entities/note/model/useGlobalNotes";
import { useUpdatePost } from "@/entities/post/model/usePosts";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type { ActiveNote } from "@/shared/types";

export function useDeleteNote() {
  const { posts: postsRepo } = useRepositories();
  const deleteGlobal = useDeleteGlobalNote();
  const updatePost = useUpdatePost();

  return useMutation({
    mutationFn: async (note: ActiveNote) => {
      if (note.isGlobal) {
        return deleteGlobal.mutateAsync(String(note.id));
      }
      const list = await postsRepo.list();
      const post = list.find((p) => p.id === note.postId);
      if (!post) throw new Error(`Post ${note.postId} not found`);
      const notes = post.notes.filter((n) => n.id !== note.id);
      return updatePost.mutateAsync({ id: note.postId, patch: { notes } });
    },
  });
}
