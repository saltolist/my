import {
  buildNoteSnapshot,
  createNewGlobalNote,
  createNewPostNote,
  EMPTY_NOTE_SNAPSHOT,
} from "@/shared/lib/noteDraft";
import type {
  ActiveNote,
  GlobalChat,
  GlobalNote,
  NoteFromScreen,
  Post,
  PostMode,
  ScreenId,
} from "@/shared/types";

export const POST_NEW_SLUG = "new";
export const NOTE_NEW_SLUG = "new";
export const GCHAT_ID_PARAM = "id";

export type ParsedAppPath = {
  screen: ScreenId;
  postId: number | null;
  postMode: PostMode;
  gchatId: string | null;
  noteGlobalId: string | null;
  notePostId: number | null;
  noteId: number | null;
  noteIsNew: boolean;
  chatId: number | null;
};

function norm(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function parsePositiveInt(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseAppPath(pathname: string): ParsedAppPath {
  const path = norm(pathname);
  const empty: ParsedAppPath = {
    screen: "home",
    postId: null,
    postMode: "chat",
    gchatId: null,
    noteGlobalId: null,
    notePostId: null,
    noteId: null,
    noteIsNew: false,
    chatId: null,
  };
  if (path === "/") return empty;

  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "feed") return { ...empty, screen: "feed" };
  if (segments[0] === "chats") return { ...empty, screen: "chats" };
  if (segments[0] === "notes") return { ...empty, screen: "notes" };
  if (segments[0] === "analytics") return { ...empty, screen: "analytics" };
  if (segments[0] === "profile") return { ...empty, screen: "profile" };

  if (segments[0] === "gchat") {
    if (segments[1]) {
      return { ...empty, screen: "gchat", gchatId: decodeURIComponent(segments[1]) };
    }
    return { ...empty, screen: "gchat" };
  }

  if (segments[0] === "post" && segments[1]) {
    if (segments[1] === POST_NEW_SLUG) {
      return { ...empty, screen: "post", postId: null, postMode: "chat" };
    }
    const postId = parsePositiveInt(segments[1]);
    if (!postId) return empty;
    return {
      ...empty,
      screen: "post",
      postId,
      postMode: "chat",
    };
  }

  if (segments[0] === "note") {
    if (segments[1] === NOTE_NEW_SLUG) {
      return { ...empty, screen: "note", noteIsNew: true };
    }
    if (segments[1] === "global" && segments[2]) {
      return { ...empty, screen: "note", noteGlobalId: segments[2] };
    }
    if (segments[1] === "post" && segments[2] && segments[3]) {
      const notePostId = parsePositiveInt(segments[2]);
      const noteId = parsePositiveInt(segments[3]);
      if (notePostId && noteId) {
        return { ...empty, screen: "note", notePostId, noteId };
      }
    }
  }

  return empty;
}

/** Старые URL `/post/5/notes/` → редирект на `/post/5/` + режим во state. */
export function parsePostLegacySub(
  pathname: string,
): { postId: number; mode: PostMode } | null {
  const path = norm(pathname);
  const m = path.match(/^\/post\/([^/]+)\/(comments|notes|chats)\/$/);
  if (!m || m[1] === POST_NEW_SLUG) return null;
  const postId = parsePositiveInt(m[1]);
  if (!postId) return null;
  const mode = m[2] as "comments" | "notes" | "chats";
  return { postId, mode };
}

export function parseChatSearchParam(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseGChatSearchParam(raw: string | null): string | null {
  if (!raw) return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
}

/** Старые URL `/gchat/gc1/` → редирект на `/gchat/?id=gc1` (static export). */
export function parseGChatLegacyPath(pathname: string): string | null {
  const path = norm(pathname);
  const m = path.match(/^\/gchat\/([^/]+)\/$/);
  if (!m) return null;
  return decodeURIComponent(m[1]);
}

export const routes = {
  home: () => "/",
  feed: () => "/feed/",
  chats: () => "/chats/",
  notes: () => "/notes/",
  analytics: () => "/analytics/",
  profile: () => "/profile/",
  gchat: (id: string) => `/gchat/?${GCHAT_ID_PARAM}=${encodeURIComponent(id)}`,
  post: (id: number | string, chatId?: number | null) => {
    const base = id === POST_NEW_SLUG ? `/post/${POST_NEW_SLUG}/` : `/post/${id}/`;
    if (chatId != null) return `${base}?chat=${chatId}`;
    return base;
  },
  /** Устаревшие подпути — только для редиректа в RouteSync. */
  postLegacySubPath: (id: number | string, sub: "comments" | "notes" | "chats") =>
    `/post/${id}/${sub}/`,
  noteNew: (from?: NoteFromScreen, postId?: number) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (postId != null) q.set("postId", String(postId));
    const qs = q.toString();
    return qs ? `/note/${NOTE_NEW_SLUG}/?${qs}` : `/note/${NOTE_NEW_SLUG}/`;
  },
  noteGlobal: (id: string) => `/note/global/${encodeURIComponent(id)}/`,
  notePost: (postId: number, noteId: number) => `/note/post/${postId}/${noteId}/`,
};

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

export function screenFromPath(pathname: string): ScreenId {
  return parseAppPath(pathname).screen;
}

export function getParentPath(pathname: string): string | null {
  const path = norm(pathname);
  if (path === "/") return null;

  const mPost = path.match(/^\/post\/([^/]+)\/$/);
  if (mPost && mPost[1] !== POST_NEW_SLUG) return routes.feed();

  if (path === "/gchat/" || path.startsWith("/gchat/")) return routes.chats();
  if (path.startsWith("/note/global/")) return routes.notes();
  if (path.match(/^\/note\/post\/\d+\/\d+\/$/)) {
    const parts = path.split("/").filter(Boolean);
    return routes.post(Number(parts[2]));
  }
  if (path.startsWith(`/note/${NOTE_NEW_SLUG}/`)) return routes.notes();

  const top = [
    routes.feed(),
    routes.chats(),
    routes.notes(),
    routes.analytics(),
    routes.profile(),
  ];
  if (top.includes(path)) return routes.home();

  return null;
}

export function canPathGoBack(pathname: string): boolean {
  return getParentPath(pathname) != null;
}

type RouteData = {
  posts: Post[];
  globalChats: GlobalChat[];
  globalNotes: GlobalNote[];
};

export function buildRoutePatch(
  parsed: ParsedAppPath,
  data: RouteData,
  chatId: number | null,
  noteFromFallback: NoteFromScreen = "notes",
): Partial<{
  screen: ScreenId;
  currentPostId: number | null;
  currentPostChatId: number | null;
  postMode: PostMode;
  isEditing: boolean;
  currentGChatId: string | null;
  currentNote: ActiveNote | null;
  noteMode: "view" | "edit";
  noteFrom: NoteFromScreen;
  noteSavedSnapshot: string;
}> {
  const base = {
    screen: parsed.screen,
    isEditing: false,
    currentGChatId: null as string | null,
    currentPostId: null as number | null,
    currentPostChatId: null as number | null,
    currentNote: null as ActiveNote | null,
  };

  if (parsed.screen === "gchat") {
    return { ...base, currentGChatId: parsed.gchatId };
  }

  if (parsed.screen === "post") {
    return {
      ...base,
      screen: "post",
      currentPostId: parsed.postId,
      currentPostChatId: chatId,
      postMode: parsed.postMode,
    };
  }

  if (parsed.screen === "note") {
    if (parsed.noteIsNew) {
      const fromPost = noteFromFallback === "post" && parsed.notePostId != null;
      const currentNote = fromPost
        ? createNewPostNote(parsed.notePostId!)
        : createNewGlobalNote();
      return {
        ...base,
        screen: "note",
        currentNote,
        noteMode: "edit",
        noteFrom: noteFromFallback,
        noteSavedSnapshot: EMPTY_NOTE_SNAPSHOT,
        ...(fromPost ? { currentPostId: parsed.notePostId } : {}),
      };
    }
    if (parsed.noteGlobalId) {
      const n = data.globalNotes.find((x) => x.id === parsed.noteGlobalId);
      if (!n) return { ...base, screen: "note", currentNote: null };
      const files = Array.isArray(n.files) ? n.files : [];
      return {
        ...base,
        screen: "note",
        currentNote: { ...n, isGlobal: true, files },
        noteFrom: "notes",
        noteMode: "view",
        noteSavedSnapshot: buildNoteSnapshot(n.title, n.body, n.ai, files),
      };
    }
    if (parsed.notePostId != null && parsed.noteId != null) {
      const post = data.posts.find((p) => p.id === parsed.notePostId);
      const n = post?.notes.find((x) => x.id === parsed.noteId);
      if (!n || !post) return { ...base, screen: "note", currentNote: null };
      const files = Array.isArray(n.files) ? n.files : [];
      return {
        ...base,
        screen: "note",
        currentPostId: parsed.notePostId,
        currentNote: { ...n, isGlobal: false, postId: parsed.notePostId, files },
        noteFrom: noteFromFallback,
        noteMode: "view",
        noteSavedSnapshot: buildNoteSnapshot(n.title, n.body, n.ai, files),
      };
    }
  }

  return base;
}

export function statePatchToHref(
  patch: Partial<{
    screen: ScreenId;
    currentPostId: number | null;
    postMode: PostMode;
    postChatId: number | null;
    gchatId: string | null;
    currentNote: ActiveNote | null;
    noteFrom: NoteFromScreen;
  }>,
  cur: { screen: ScreenId; currentPostId: number | null; postMode: PostMode },
): string | null {
  const screen = patch.screen ?? cur.screen;

  if (screen === "post") {
    const id = patch.currentPostId ?? cur.currentPostId;
    if (id == null) return routes.post(POST_NEW_SLUG);
    return routes.post(id, patch.postChatId ?? null);
  }

  if (screen === "gchat" && patch.gchatId) {
    return routes.gchat(patch.gchatId);
  }

  if (screen === "note" && patch.currentNote) {
    const n = patch.currentNote;
    if (n.isNew) return routes.noteNew(patch.noteFrom);
    if (n.isGlobal && typeof n.id === "string") return routes.noteGlobal(n.id);
    if (!n.isGlobal && n.postId != null) return routes.notePost(n.postId, n.id as number);
  }

  if (screen === "note") return routes.noteNew(patch.noteFrom);

  return screenToHref(screen);
}

export function isPathActive(
  pathname: string,
  target: string,
  opts?: { exact?: boolean },
): boolean {
  const a = norm(pathname);
  const b = norm(target);
  if (opts?.exact) return a === b;
  return a === b || a.startsWith(b);
}
