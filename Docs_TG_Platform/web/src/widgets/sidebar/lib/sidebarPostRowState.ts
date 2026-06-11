import type { ScreenId } from "@/shared/types";

type PostRowRoute = {
  postId: number | null;
  notePostId: number | null;
  postChatId: number | null;
};

export function resolveSidebarPostId(
  screen: ScreenId,
  postId: number | null,
  notePostId: number | null,
): number | null {
  if (screen === "post" && postId != null) return postId;
  if (screen === "note" && notePostId != null) return notePostId;
  return null;
}

export function shouldShowFeedPostRow(
  sidebarPostId: number | null,
  screen: ScreenId,
  notePostId: number | null,
): boolean {
  return sidebarPostId != null && (screen === "post" || (screen === "note" && notePostId != null));
}

export function isSidebarPostFullActive(
  sidebarPostId: number | null,
  screen: ScreenId,
  route: PostRowRoute,
): boolean {
  return (
    sidebarPostId != null &&
    screen === "post" &&
    route.postId === sidebarPostId &&
    route.postChatId == null
  );
}

export function isSidebarPostSubActive(
  sidebarPostId: number | null,
  screen: ScreenId,
  route: PostRowRoute,
): boolean {
  if (sidebarPostId == null) return false;
  if (isSidebarPostFullActive(sidebarPostId, screen, route)) return false;
  return (
    (screen === "post" &&
      route.postId === sidebarPostId &&
      route.postChatId != null) ||
    (screen === "note" && route.notePostId === sidebarPostId)
  );
}
