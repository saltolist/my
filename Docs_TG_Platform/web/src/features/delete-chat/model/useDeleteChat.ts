"use client";

import { useCallback } from "react";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";
import { routes } from "@/shared/lib/routes";

type GlobalTarget = { scope: "global"; chatId: string; title: string };
type LocalTarget = { scope: "local"; postId: number; chatId: number; title: string };

export function useDeleteChat() {
  const { dispatch } = useDomain();
  const { goToHref, screen, currentGChatId } = useNavigation();

  return useCallback(
    (target: GlobalTarget | LocalTarget) => {
      if (!window.confirm(`Удалить чат «${target.title}»?`)) return;
      if (target.scope === "global") {
        dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: target.chatId });
        if (screen === "gchat" && currentGChatId === target.chatId) {
          goToHref(routes.chats(), { replace: true });
        }
      } else {
        dispatch({
          type: "DELETE_LOCAL_CHAT",
          postId: target.postId,
          chatId: target.chatId,
        });
      }
    },
    [dispatch, goToHref, screen, currentGChatId],
  );
}
