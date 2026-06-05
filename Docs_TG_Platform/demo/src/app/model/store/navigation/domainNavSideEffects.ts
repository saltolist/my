import type { NavigationPatch, NavigationState } from "@/app/model/store/navigation/types";
import type { DomainAction } from "@/app/model/store/domain/reducer";
import type { DomainState } from "@/app/model/store/domain/types";
import { telegramConfigNavPatch } from "@/app/model/store/navigation/buildPatch";

export function getDomainActionNavPatch(
  action: DomainAction,
  nav: NavigationState,
  _prevDomain: DomainState,
  _nextDomain: DomainState,
): NavigationPatch | null {
  switch (action.type) {
    case "DELETE_LOCAL_CHAT":
      return nav.currentPostChatId === action.chatId ? { currentPostChatId: null } : null;
    case "DELETE_POST":
      return { currentPostId: null };
    case "DELETE_GLOBAL_CHAT":
      return nav.currentGChatId === action.chatId ? { currentGChatId: null } : null;
    case "UPDATE_TELEGRAM_CONFIG":
      return telegramConfigNavPatch(nav, action.config);
    default:
      return null;
  }
}
