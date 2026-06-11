import type { NavigationState, RouteNavigationPatch } from "@/app/model/store/navigation/types";
import { queryKeys } from "@/shared/api/queryKeys";
import { isNoteDirty, noteIdentityKey } from "@/shared/lib/noteDraft";
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

type PostModeStore = {
  getMode: (postId: number) => PostMode;
  getCurrentPostChatId: (postId: number) => number | null;
  setMode: (postId: number, mode: PostMode, chatId?: number | null) => void;
};

/** Route sync must not re-call setMode when mode already matches — setMode toggles tab modes. */
export function syncPostModeFromRoute(store: PostModeStore, postMode: PostModeSync): void {
  const currentMode = store.getMode(postMode.postId);
  const currentChatId = store.getCurrentPostChatId(postMode.postId);
  if (currentMode === postMode.mode && currentChatId === postMode.chatId) return;
  store.setMode(postMode.postId, postMode.mode, postMode.chatId);
}

export type SyncRouteResult =
  | { kind: "redirect"; href: string; postMode?: PostModeSync }
  | { kind: "sync"; patch: RouteNavigationPatch; postMode?: PostModeSync };

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

  const routePatch = buildRoutePatch(parsedNote, data, noteFrom);

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

  const patch: RouteNavigationPatch = {
    screen: routePatch.screen ?? parsed.screen,
    currentPostId: routePatch.currentPostId ?? null,
    isEditing: routePatch.isEditing ?? false,
    currentNote: routePatch.currentNote ?? null,
    noteMode: routePatch.noteMode ?? "view",
    noteFrom: routePatch.noteFrom ?? noteFrom,
    noteSavedSnapshot: routePatch.noteSavedSnapshot ?? "",
  };

  return { kind: "sync", patch, postMode: postModeSync };
}

type NoteDraftState = Pick<
  NavigationState,
  "currentNote" | "noteMode" | "noteFrom" | "noteSavedSnapshot" | "currentPostId"
>;

/** Skip note fields on cache resync when a draft is open or dirty. */
export function mergeNoteCachePatch(
  current: NoteDraftState,
  incoming: RouteNavigationPatch,
  noteDirty = false,
): RouteNavigationPatch {
  const touchesNote =
    incoming.currentNote !== undefined ||
    incoming.noteMode !== undefined ||
    incoming.noteFrom !== undefined ||
    incoming.noteSavedSnapshot !== undefined;

  if (!touchesNote || !shouldPreserveNoteDraft(current, incoming, noteDirty)) {
    return incoming;
  }

  const next = { ...incoming };
  delete next.currentNote;
  delete next.noteMode;
  delete next.noteFrom;
  delete next.noteSavedSnapshot;
  if (current.currentNote?.isNew) {
    delete next.currentPostId;
  }
  return next;
}

function shouldPreserveNoteDraft(
  current: NoteDraftState,
  incoming: RouteNavigationPatch,
  noteDirty = false,
): boolean {
  if (!current.currentNote) return false;
  if (current.currentNote.isNew) return true;
  if (noteDirty) return true;

  const incomingNote = incoming.currentNote;
  if (incomingNote && noteIdentityKey(current.currentNote) !== noteIdentityKey(incomingNote)) {
    return false;
  }

  return isNoteDirty(current.currentNote, current.noteSavedSnapshot);
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

/** Which list query updates should trigger note cache resync for this path. */
export function isNoteRouteDataQuery(pathname: string, queryKey: readonly unknown[]): boolean {
  if (queryKey[1] !== "list") return false;
  const parsed = parseAppPath(pathname);
  if (parsed.noteGlobalId) {
    return queryKey[0] === queryKeys.globalNotes.all[0];
  }
  if (parsed.notePostId != null && parsed.noteId != null) {
    return queryKey[0] === queryKeys.posts.all[0];
  }
  return false;
}
