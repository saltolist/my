"use client";

import { useCallback } from "react";
import { domainActions, useDomainDispatch, useNavigation } from "@/app/model/store";
import { routes } from "@/shared/lib/routes";

type GlobalTarget = { scope: "global"; chatId: string; title: string };
type LocalTarget = { scope: "local"; postId: number; chatId: number; title: string };

export function useDeleteChat() {
  const dispatch = useDomainDispatch();
  const { goToHref, screen, currentGChatId } = useNavigation();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить чат «${target.title}»?`)) return;
      if (target.scope === "global") {
        dispatch(domainActions.deleteGlobalChat(target.chatId));
        if (screen === "gchat" && currentGChatId === target.chatId) {
          goToHref(routes.chats(), { replace: true });
        }
      } else {
        dispatch(domainActions.deleteLocalChat(target.postId, target.chatId));
      }
    },
    [dispatch, goToHref, screen, currentGChatId],
  );
}
