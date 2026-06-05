import type { NavigationPatch, NavigationState } from "@/state/navigation/types";
import type { DomainAction } from "@/state/domain/reducer";
import type { DomainState } from "@/state/domain/types";
import { telegramConfigNavPatch } from "@/state/navigation/buildPatch";

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
