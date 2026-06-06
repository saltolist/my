import { initialNavigationState, type NavigationState } from "@/app/model/store/navigation/types";
import { parseAppPath, parseChatSearchParam, parseGChatSearchParam } from "@/shared/lib/routes";

/** Seed navigation reducer from the current URL (client-only). */
export function initialNavFromPathname(pathname: string, search = ""): NavigationState {
  const parsed = parseAppPath(pathname);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const chatId = parseChatSearchParam(params.get("chat"));
  const gchatId = parsed.gchatId ?? parseGChatSearchParam(params.get("id"));

  if (parsed.screen === "post") {
    return {
      ...initialNavigationState,
      screen: "post",
      currentPostId: parsed.postId,
      currentPostChatId: chatId,
      postMode: parsed.postMode,
    };
  }

  if (parsed.screen === "gchat" && gchatId) {
    return { ...initialNavigationState, screen: "gchat", currentGChatId: gchatId };
  }

  if (parsed.screen !== "home") {
    return { ...initialNavigationState, screen: parsed.screen };
  }

  return initialNavigationState;
}
