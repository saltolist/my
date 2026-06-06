"use client";

import { useCallback } from "react";
import { useDomain } from "@/app/model/store/domain-store";

type GlobalTarget = { isGlobal: true; noteId: string };
type LocalTarget = { isGlobal: false; postId: number; noteId: number };

export function useRenameNote() {
  const { state, dispatch } = useDomain();

  return useCallback(
    (target: GlobalTarget | LocalTarget, title: string) => {
      const next = window.prompt("Новое название заметки", title);
      if (next == null) return;
      const t = next.trim();
      if (!t) return;
      if (target.isGlobal) {
        const n = state.globalNotes.find((x) => x.id === target.noteId);
        if (!n) return;
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, title: t } });
      } else {
        dispatch({
          type: "UPDATE_POST_NOTE",
          postId: target.postId,
          noteId: target.noteId,
          patch: { title: t },
        });
      }
    },
    [dispatch, state.globalNotes],
  );
}
