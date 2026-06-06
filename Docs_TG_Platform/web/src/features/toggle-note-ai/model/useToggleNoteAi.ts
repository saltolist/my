"use client";

import { useCallback } from "react";
import { useDomain } from "@/app/model/store/domain-store";

type GlobalTarget = { isGlobal: true; noteId: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number };

export function useToggleNoteAi() {
  const { state, dispatch } = useDomain();

  return useCallback(
    (target: GlobalTarget | LocalTarget, ai: boolean) => {
      const next = !ai;
      if (target.isGlobal) {
        const n = state.globalNotes.find((x) => x.id === target.noteId);
        if (!n) return;
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, ai: next } });
      } else {
        dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: target.postId, noteId: target.noteId });
      }
    },
    [dispatch, state.globalNotes],
  );
}
