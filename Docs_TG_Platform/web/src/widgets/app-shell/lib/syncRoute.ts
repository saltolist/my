import type { NavigationPatch } from "@/app/model/store/navigation/types";
import {
  buildRoutePatch,
  parseAppPath,
  parseChatSearchParam,
  parseGChatLegacyPath,
  parseGChatSearchParam,
  parsePostLegacySub,
  routes,
} from "@/shared/lib/routes";
import type { GlobalChat, GlobalNote, NoteFromScreen, Post, PostMode } from "@/shared/types";

export type RouteSyncData = {
  posts: Post[];
  globalChats: GlobalChat[];
  globalNotes: GlobalNote[];
};

export type PostModeSync = {
  postId: number;
  mode: PostMode;
  chatId: number | null;
};

export type SyncRouteResult =
  | { kind: "redirect"; href: string; postMode?: PostModeSync }
  | { kind: "sync"; patch: NavigationPatch; postMode?: PostModeSync };

export type SyncRouteOptions = {
  /** Resolved from legacy redirect or post-navigation store before sync. */
  postModeOverride?: PostMode | null;
  getPostMode?: (postId: number) => PostMode;
};

export function syncRouteFromUrl(
  pathname: string,
  searchParams: URLSearchParams,
  data: RouteSyncData,
  options: SyncRouteOptions = {},
): SyncRouteResult {
  const path = pathname || "/";

  const legacyGchatId = parseGChatLegacyPath(path);
  if (legacyGchatId) {
    return { kind: "redirect", href: routes.gchat(legacyGchatId) };
  }

  const legacySub = parsePostLegacySub(path);
  if (legacySub) {
    const chatQ = searchParams.get("chat");
    const href =
      chatQ != null
        ? `${routes.post(legacySub.postId)}?chat=${chatQ}`
        : routes.post(legacySub.postId);
    return {
      kind: "redirect",
      href,
      postMode: {
        postId: legacySub.postId,
        mode: legacySub.mode,
        chatId: parseChatSearchParam(chatQ),
      },
    };
  }

  const parsed = parseAppPath(path);
  const gchatId = parsed.gchatId ?? parseGChatSearchParam(searchParams.get("id"));
  const chatId = parseChatSearchParam(searchParams.get("chat"));
  const fromParam = searchParams.get("from");
  const noteFrom: NoteFromScreen = fromParam === "post" ? "post" : "notes";
  const notePostId = Number(searchParams.get("postId"));
  const parsedNote = {
    ...parsed,
    gchatId,
    notePostId:
      parsed.noteIsNew && Number.isFinite(notePostId) && notePostId > 0
        ? notePostId
        : parsed.notePostId,
  };

  const routePatch = buildRoutePatch(parsedNote, data, chatId, noteFrom);

  let postMode = routePatch.postMode ?? "chat";
  let postModeSync: PostModeSync | undefined;

  if (parsed.screen === "post" && parsed.postId != null) {
    const resolvedMode =
      options.postModeOverride ?? options.getPostMode?.(parsed.postId) ?? "chat";
    postMode = resolvedMode;
    postModeSync = {
      postId: parsed.postId,
      mode: postMode,
      chatId,
    };
  }

  const patch: NavigationPatch = {
    screen: routePatch.screen ?? parsed.screen,
    currentPostId: routePatch.currentPostId ?? null,
    currentPostChatId: routePatch.currentPostChatId ?? chatId,
    postMode,
    isEditing: routePatch.isEditing ?? false,
    currentGChatId: routePatch.currentGChatId ?? gchatId,
    currentNote: routePatch.currentNote ?? null,
    noteMode: routePatch.noteMode ?? "view",
    noteFrom: routePatch.noteFrom ?? noteFrom,
    noteSavedSnapshot: routePatch.noteSavedSnapshot ?? "",
  };

  return { kind: "sync", patch, postMode: postModeSync };
}

/** Build dedup key for RouteSync effect. */
export function routeSyncKey(pathname: string, searchParams: URLSearchParams): string {
  return `${pathname || "/"}?${searchParams.toString()}`;
}

/** Note screens load `currentNote` from React Query cache in RouteSync. */
export function routeNeedsCachedData(pathname: string): boolean {
  const parsed = parseAppPath(pathname);
  if (parsed.screen !== "note") return false;
  if (parsed.noteGlobalId) return true;
  return parsed.notePostId != null && parsed.noteId != null;
}
