"use client";

import { useCallback } from "react";
import { useDomain } from "@/app/model/store/domain-store";

type GlobalTarget = { scope: "global"; chatId: string };
type LocalTarget = { scope: "local"; postId: number; chatId: number };

export function useRenameChat() {
  const { dispatch } = useDomain();

  return useCallback(
    (target: GlobalTarget | LocalTarget, title: string) => {
      const next = window.prompt("Новое название чата", title);
      if (next == null) return;
      const t = next.trim();
      if (!t) return;
      if (target.scope === "global") {
        dispatch({ type: "RENAME_GLOBAL_CHAT", chatId: target.chatId, title: t });
      } else {
        dispatch({
          type: "RENAME_LOCAL_CHAT",
          postId: target.postId,
          chatId: target.chatId,
          title: t,
        });
      }
    },
    [dispatch],
  );
}
