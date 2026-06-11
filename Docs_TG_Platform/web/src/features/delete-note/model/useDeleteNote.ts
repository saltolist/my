"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { useNavigationStore } from "@/app/model/store/navigation-store";
import { useDeleteGlobalNote } from "@/entities/note";
import { useDeletePostNote } from "@/entities/post/model/usePostNoteMutations";
import { routes, screenFromPath } from "@/shared/lib/routes";

type GlobalTarget = { isGlobal: true; noteId: string; title: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number; title: string };

export function useDeleteNote() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const screen = screenFromPath(pathname);
  const currentNote = useNavigationStore((s) => s.currentNote);
  const noteFrom = useNavigationStore((s) => s.noteFrom);
  const deleteGlobalNote = useDeleteGlobalNote();
  const deletePostNote = useDeletePostNote();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить заметку «${target.title}»?`)) return;
      if (target.isGlobal) {
        void deleteGlobalNote.mutateAsync(target.noteId);
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === target.noteId) {
          router.replace(routes.notes());
        }
      } else {
        void deletePostNote(target.postId, target.noteId);
        const cur = currentNote;
        if (
          screen === "note" &&
          cur &&
          cur.isGlobal === false &&
          cur.postId === target.postId &&
          cur.id === target.noteId
        ) {
          router.replace(noteFrom === "post" ? routes.post(target.postId) : routes.notes());
        }
      }
    },
    [currentNote, deleteGlobalNote, deletePostNote, noteFrom, router, screen],
  );
}
