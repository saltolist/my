"use client";

import { useMutation } from "@tanstack/react-query";
import { useUpsertGlobalNote } from "@/entities/note/model/useGlobalNotes";
import { useUpdatePost } from "@/entities/post/model/usePosts";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type { ActiveNote } from "@/shared/types";

export function useToggleNoteAi() {
  const { posts: postsRepo } = useRepositories();
  const upsertGlobal = useUpsertGlobalNote();
  const updatePost = useUpdatePost();

  return useMutation({
    mutationFn: async (note: ActiveNote) => {
      const nextAi = !note.ai;
      if (note.isGlobal) {
        return upsertGlobal.mutateAsync({ ...note, ai: nextAi, id: String(note.id) });
      }
      const list = await postsRepo.list();
      const post = list.find((p) => p.id === note.postId);
      if (!post) throw new Error(`Post ${note.postId} not found`);
      const notes = post.notes.map((n) => (n.id === note.id ? { ...n, ai: nextAi } : n));
      return updatePost.mutateAsync({ id: note.postId, patch: { notes } });
    },
  });
}
