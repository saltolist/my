"use client";

import { useCallback } from "react";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";
import { routes } from "@/shared/lib/routes";

type GlobalTarget = { isGlobal: true; noteId: string; title: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number; title: string };

export function useDeleteNote() {
  const { dispatch } = useDomain();
  const { goToHref, screen, currentNote, noteFrom } = useNavigation();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить заметку «${target.title}»?`)) return;
      if (target.isGlobal) {
        dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: target.noteId });
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === target.noteId) {
          goToHref(routes.notes(), { replace: true });
        }
      } else {
        dispatch({ type: "DELETE_POST_NOTE", postId: target.postId, noteId: target.noteId });
        const cur = currentNote;
        if (
          screen === "note" &&
          cur &&
          cur.isGlobal === false &&
          cur.postId === target.postId &&
          cur.id === target.noteId
        ) {
          goToHref(noteFrom === "post" ? routes.post(target.postId) : routes.notes(), {
            replace: true,
          });
        }
      }
    },
    [dispatch, goToHref, screen, currentNote, noteFrom],
  );
}
