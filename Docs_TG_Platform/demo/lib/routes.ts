import {
  buildNoteSnapshot,
  createNewGlobalNote,
  createNewPostNote,
  EMPTY_NOTE_SNAPSHOT,
} from "@/lib/noteDraft";
import { postTitle, truncate } from "@/lib/helpers";
import { postViewBackTitle, routeSnapshotTitle } from "@/lib/routeLabels";
import type {
  ActiveNote,
  GlobalChat,
  GlobalNote,
  NoteFromScreen,
  Post,
  PostMode,
  ScreenId,
} from "@/lib/types";

export const POST_NEW_SLUG = "new";
export const NOTE_NEW_SLUG = "new";

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

  if (segments[0] === "gchat" && segments[1]) {
    return { ...empty, screen: "gchat", gchatId: segments[1] };
  }

  if (segments[0] === "post" && segments[1]) {
    if (segments[1] === POST_NEW_SLUG) {
      return { ...empty, screen: "post", postId: null, postMode: "chat" };
    }
    const postId = parsePositiveInt(segments[1]);
    if (!postId) return empty;
    const sub = segments[2];
    const postMode: PostMode =
      sub === "comments" ? "comments" : sub === "notes" ? "notes" : sub === "chats" ? "chats" : "chat";
    return {
      ...empty,
      screen: "post",
      postId,
      postMode,
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

export function parseChatSearchParam(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const routes = {
  home: () => "/",
  feed: () => "/feed/",
  chats: () => "/chats/",
  notes: () => "/notes/",
  analytics: () => "/analytics/",
  profile: () => "/profile/",
  gchat: (id: string) => `/gchat/${encodeURIComponent(id)}/`,
  post: (id: number | string, chatId?: number | null) => {
    const base = id === POST_NEW_SLUG ? `/post/${POST_NEW_SLUG}/` : `/post/${id}/`;
    if (chatId != null) return `${base}?chat=${chatId}`;
    return base;
  },
  postComments: (id: number | string) => `/post/${id}/comments/`,
  postNotes: (id: number | string) => `/post/${id}/notes/`,
  postChats: (id: number | string) => `/post/${id}/chats/`,
  postSub: (id: number | string, mode: PostMode, chatId?: number | null) => {
    if (mode === "comments") return routes.postComments(id);
    if (mode === "notes") return routes.postNotes(id);
    if (mode === "chats") return routes.postChats(id);
    return routes.post(id, chatId);
  },
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

  const mPostSub = path.match(/^\/post\/([^/]+)\/(comments|notes|chats)\/$/);
  if (mPostSub) return `/post/${mPostSub[1]}/`;

  const mPost = path.match(/^\/post\/([^/]+)\/$/);
  if (mPost && mPost[1] !== POST_NEW_SLUG) return routes.feed();

  if (path.startsWith("/gchat/")) return routes.chats();
  if (path.startsWith("/note/global/")) return routes.notes();
  if (path.match(/^\/note\/post\/\d+\/\d+\/$/)) {
    const parts = path.split("/").filter(Boolean);
    return routes.postNotes(Number(parts[2]));
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

export function parsedToRouteSnapshot(
  parsed: ParsedAppPath,
  posts: Post[],
): Parameters<typeof routeSnapshotTitle>[0] {
  return {
    screen: parsed.screen,
    currentPostId: parsed.postId,
    postMode: parsed.postMode,
    currentGChatId: parsed.gchatId,
  };
}

export function getBackTitleForPath(pathname: string, posts: Post[]): string | null {
  const parent = getParentPath(pathname);
  if (!parent) return null;
  const parsed = parseAppPath(pathname);
  if (parsed.screen === "post" && parsed.postMode !== "chat") {
    return postViewBackTitle("chat");
  }
  const parentParsed = parseAppPath(parent);
  return routeSnapshotTitle(parsedToRouteSnapshot(parentParsed, posts), posts);
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
  postViewStack: { mode: PostMode; chatId: number | null }[];
  isEditing: boolean;
  currentGChatId: string | null;
  currentNote: ActiveNote | null;
  noteMode: "view" | "edit";
  noteFrom: NoteFromScreen;
  noteSavedSnapshot: string;
}> {
  const base = {
    screen: parsed.screen,
    postViewStack: [] as { mode: PostMode; chatId: number | null }[],
    isEditing: false,
  };

  if (parsed.screen === "gchat" && parsed.gchatId) {
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
    currentPostChatId: number | null;
    currentGChatId: string | null;
    currentNote: ActiveNote | null;
    noteFrom: NoteFromScreen;
  }>,
  cur: { screen: ScreenId; currentPostId: number | null; postMode: PostMode },
): string | null {
  const screen = patch.screen ?? cur.screen;

  if (screen === "post") {
    const id = patch.currentPostId ?? cur.currentPostId;
    if (id == null) return routes.post(POST_NEW_SLUG);
    const mode = patch.postMode ?? cur.postMode ?? "chat";
    return routes.postSub(id, mode, patch.currentPostChatId ?? null);
  }

  if (screen === "gchat" && patch.currentGChatId) {
    return routes.gchat(patch.currentGChatId);
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
