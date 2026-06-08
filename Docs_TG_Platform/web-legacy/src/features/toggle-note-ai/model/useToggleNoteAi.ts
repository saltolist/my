"use client";

import { useCallback } from "react";
import { domainActions, selectGlobalNotes, useDomainDispatch, useDomainSelector } from "@/app/model/store";

type GlobalTarget = { isGlobal: true; noteId: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number };

export function useToggleNoteAi() {
  const globalNotes = useDomainSelector(selectGlobalNotes);
  const dispatch = useDomainDispatch();

  return useCallback(
    (target: GlobalTarget | LocalTarget, ai: boolean) => {
      const next = !ai;
      if (target.isGlobal) {
        const n = globalNotes.find((x) => x.id === target.noteId);
        if (!n) return;
        dispatch(domainActions.upsertGlobalNote({ ...n, ai: next }));
      } else {
        dispatch(domainActions.togglePostNoteAi(target.postId, target.noteId));
      }
    },
    [dispatch, globalNotes],
  );
}
