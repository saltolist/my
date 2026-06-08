"use client";

import { useCallback } from "react";
import { domainActions, useDomainDispatch, useNavigation } from "@/app/model/store";
import { routes } from "@/shared/lib/routes";

type GlobalTarget = { isGlobal: true; noteId: string; title: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number; title: string };

export function useDeleteNote() {
  const dispatch = useDomainDispatch();
  const { goToHref, screen, currentNote, noteFrom } = useNavigation();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить заметку «${target.title}»?`)) return;
      if (target.isGlobal) {
        dispatch(domainActions.deleteGlobalNote(target.noteId));
        const cur = currentNote;
        if (screen === "note" && cur?.isGlobal === true && cur.id === target.noteId) {
          goToHref(routes.notes(), { replace: true });
        }
      } else {
        dispatch(domainActions.deletePostNote(target.postId, target.noteId));
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
