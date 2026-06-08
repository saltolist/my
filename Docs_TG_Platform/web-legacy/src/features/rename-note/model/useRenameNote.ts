"use client";

import { useCallback } from "react";
import { domainActions, selectGlobalNotes, useDomainDispatch, useDomainSelector } from "@/app/model/store";

type GlobalTarget = { isGlobal: true; noteId: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number };

export function useRenameNote() {
  const globalNotes = useDomainSelector(selectGlobalNotes);
  const dispatch = useDomainDispatch();

  return useCallback(
    (target: GlobalTarget | LocalTarget, title: string) => {
      const next = window.prompt("Новое название заметки", title);
      if (next == null) return;
      const t = next.trim();
      if (!t) return;
      if (target.isGlobal) {
        const n = globalNotes.find((x) => x.id === target.noteId);
        if (!n) return;
        dispatch(domainActions.upsertGlobalNote({ ...n, title: t }));
      } else {
        dispatch(domainActions.updatePostNote(target.postId, target.noteId, { title: t }));
      }
    },
    [dispatch, globalNotes],
  );
}
