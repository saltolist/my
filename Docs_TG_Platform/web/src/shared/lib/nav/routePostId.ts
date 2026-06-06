import { parseAppPath } from "@/shared/lib/routes";

/** Prefer navigation state; fall back to URL when RouteSync has not run yet. */
export function resolveRoutePostId(pathname: string, currentPostId: number | null): number | null {
  if (currentPostId != null) return currentPostId;
  return parseAppPath(pathname).postId;
}
