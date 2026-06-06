"use client";

import { useCallback } from "react";
import { domainActions, useDomainDispatch } from "@/app/model/store";

type GlobalTarget = { scope: "global"; chatId: string };
type LocalTarget = { scope: "local"; postId: number; chatId: number };

export function useRenameChat() {
  const dispatch = useDomainDispatch();

  return useCallback(
    (target: GlobalTarget | LocalTarget, title: string) => {
      const next = window.prompt("Новое название чата", title);
      if (next == null) return;
      const t = next.trim();
      if (!t) return;
      if (target.scope === "global") {
        dispatch(domainActions.renameGlobalChat(target.chatId, t));
      } else {
        dispatch(domainActions.renameLocalChat(target.postId, target.chatId, t));
      }
    },
    [dispatch],
  );
}
