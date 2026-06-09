import type { ScreenId } from "@/shared/types";

function norm(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export const routes = {
  home: () => "/",
  feed: () => "/feed/",
  chats: () => "/chats/",
  notes: () => "/notes/",
  analytics: () => "/analytics/",
  profile: () => "/profile/",
} as const;

export function screenFromPath(pathname: string): ScreenId {
  const path = norm(pathname);
  if (path === "/") return "home";
  if (path.startsWith("/feed")) return "feed";
  if (path.startsWith("/chats")) return "chats";
  if (path.startsWith("/notes")) return "notes";
  if (path.startsWith("/analytics")) return "analytics";
  if (path.startsWith("/profile")) return "profile";
  return "home";
}

export function screenToHref(screen: ScreenId): string {
  switch (screen) {
    case "home":
      return routes.home();
    case "feed":
      return routes.feed();
    case "chats":
      return routes.chats();
    case "notes":
      return routes.notes();
    case "analytics":
      return routes.analytics();
    case "profile":
      return routes.profile();
    default:
      return routes.home();
  }
}

export function isPathActive(pathname: string, target: string): boolean {
  const a = norm(pathname);
  const b = norm(target);
  return a === b;
}
