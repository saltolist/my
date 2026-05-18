"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  initialAiProfileConfig,
  initialChannelProfileConfig,
  initialGlobalChats,
  initialGlobalNotes,
  initialPinnedPostIds,
  initialPosts,
  initialTelegramProfileConfig,
} from "@/lib/data";
import {
  buildMultiResponsePairs,
  formatWebSearchComposerLabel,
  isOpenAiWebSearchModel,
  isWebSearchVisibleForLlm,
  VARIANT_TAILS,
} from "@/lib/composer-config";
import { getGlobalReply, getPostReply } from "@/lib/replies";
import { postTitle, truncate } from "@/lib/helpers";
import {
  appendToActiveHistory,
  applyUserMessageSave,
  lastUserPreviewFromVisibleHistory,
  mapMessageAtPath,
  removeMessageAtPath,
  setActiveUserBranch,
} from "@/lib/chatPaths";
import type {
  ActiveNote,
  AiProfileConfig,
  AiVariant,
  ChannelProfileConfig,
  ChatMessage,
  ChatsTab,
  ComposerScope,
  ComposerTarget,
  GlobalChat,
  GlobalNote,
  LocalChat,
  LocalNote,
  NoteFile,
  NoteFromScreen,
  NoteListFilter,
  NoteMode,
  NoteScope,
  Post,
  PostComment,
  PostMode,
  ScreenId,
  TelegramProfileConfig,
  ThemeMode,
} from "@/lib/types";

type ComposerTargets = Record<ComposerScope, ComposerTarget>;

type State = {
  posts: Post[];
  globalChats: GlobalChat[];
  globalNotes: GlobalNote[];
  channelProfileConfig: ChannelProfileConfig;
  aiProfileConfig: AiProfileConfig;
  telegramProfileConfig: TelegramProfileConfig;
  pinnedPostIds: number[];

  screen: ScreenId;
  currentPostId: number | null;
  currentPostChatId: number | null;
  postMode: PostMode;
  postViewStack: { mode: PostMode; chatId: number | null }[];
  isEditing: boolean;
  currentGChatId: string | null;
  currentNote: ActiveNote | null;
  noteMode: NoteMode;
  noteFrom: NoteFromScreen;
  noteSavedSnapshot: string;

  chatsTab: ChatsTab;
  noteScope: NoteScope;
  noteFilter: NoteListFilter;

  composerTargets: ComposerTargets;

  systemPromptSavedSnapshot: string;
  modelSettingsSavedSnapshot: string;
  telegramSettingsSavedSnapshot: string;
  channelProfileSavedSnapshot: string;

  theme: ThemeMode;
};

/** Subset of app state restored when the user goes «back» through the nav stack. */
type RouteSnapshot = Pick<
  State,
  | "screen"
  | "currentPostId"
  | "currentPostChatId"
  | "postMode"
  | "postViewStack"
  | "isEditing"
  | "currentGChatId"
  | "currentNote"
  | "noteMode"
  | "noteFrom"
  | "noteSavedSnapshot"
  | "chatsTab"
  | "noteScope"
  | "noteFilter"
>;

function captureRouteState(s: State): RouteSnapshot {
  return {
    screen: s.screen,
    currentPostId: s.currentPostId,
    currentPostChatId: s.currentPostChatId,
    postMode: s.postMode,
    postViewStack: s.postViewStack.map((x) => ({ ...x })),
    isEditing: s.isEditing,
    currentGChatId: s.currentGChatId,
    currentNote: s.currentNote
      ? {
          ...s.currentNote,
          files: s.currentNote.files ? s.currentNote.files.map((f) => ({ ...f })) : [],
        }
      : null,
    noteMode: s.noteMode,
    noteFrom: s.noteFrom,
    noteSavedSnapshot: s.noteSavedSnapshot,
    chatsTab: s.chatsTab,
    noteScope: s.noteScope,
    noteFilter: s.noteFilter,
  };
}

type Action =
  | { type: "SET_SCREEN"; screen: ScreenId }
  | { type: "SET_STATE"; patch: Partial<State> }
  | { type: "UPDATE_POSTS"; posts: Post[] }
  | { type: "UPDATE_POST"; postId: number; patch: Partial<Post> }
  | { type: "ADD_LOCAL_CHAT"; postId: number; chat: LocalChat }
  | { type: "PUSH_LOCAL_CHAT_MSG"; postId: number; chatId: number; message: ChatMessage }
  | { type: "UPDATE_LOCAL_CHAT_MESSAGE"; postId: number; chatId: number; path: number[]; text: string }
  | { type: "DELETE_LOCAL_CHAT_MESSAGE"; postId: number; chatId: number; path: number[] }
  | { type: "DELETE_LOCAL_CHAT"; postId: number; chatId: number }
  | { type: "ADD_POST_NOTE"; postId: number; note: LocalNote }
  | { type: "DELETE_POST_NOTE"; postId: number; noteId: number }
  | { type: "TOGGLE_POST_NOTE_AI"; postId: number; noteId: number }
  | { type: "UPDATE_POST_NOTE"; postId: number; noteId: number; patch: Partial<LocalNote> }
  | { type: "DELETE_POST"; postId: number }
  | { type: "ADD_POST_COMMENT"; postId: number; comment: PostComment }
  | { type: "REORDER_POSTS"; posts: Post[] }
  | { type: "ADD_GLOBAL_CHAT"; chat: GlobalChat }
  | { type: "PUSH_GLOBAL_CHAT"; chatId: string; message: ChatMessage }
  | { type: "UPDATE_GLOBAL_CHAT_MESSAGE"; chatId: string; path: number[]; text: string }
  | { type: "DELETE_GLOBAL_CHAT_MESSAGE"; chatId: string; path: number[] }
  | { type: "DELETE_GLOBAL_CHAT"; chatId: string }
  | { type: "RENAME_GLOBAL_CHAT"; chatId: string; title: string }
  | { type: "RENAME_LOCAL_CHAT"; postId: number; chatId: number; title: string }
  | { type: "UPDATE_GLOBAL_NOTES"; notes: GlobalNote[] }
  | { type: "UPSERT_GLOBAL_NOTE"; note: GlobalNote }
  | { type: "DELETE_GLOBAL_NOTE"; noteId: string }
  | { type: "SET_AI_VARIANT"; scope: "gchat" | "post"; entityId: string | number; path: number[]; variantIdx: number }
  | { type: "SET_USER_BRANCH"; scope: "gchat" | "post"; postId?: number; entityId: string | number; path: number[]; branchIdx: number }
  | { type: "UPDATE_CHANNEL_PROFILE"; config: ChannelProfileConfig }
  | { type: "UPDATE_AI_CONFIG"; config: AiProfileConfig }
  | { type: "UPDATE_TELEGRAM_CONFIG"; config: TelegramProfileConfig };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "SET_STATE":
      return { ...state, ...action.patch };
    case "UPDATE_POSTS":
      return { ...state, posts: action.posts };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.postId ? { ...p, ...action.patch } : p)),
      };
    case "ADD_LOCAL_CHAT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId ? { ...p, chats: [action.chat, ...p.chats] } : p,
        ),
      };
    case "PUSH_LOCAL_CHAT_MSG":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                chats: p.chats.map((c) => {
                  if (c.id !== action.chatId) return c;
                  const history = appendToActiveHistory(c.history, action.message);
                  return {
                    ...c,
                    history,
                    preview:
                      action.message.role === "user" && action.message.text
                        ? action.message.text
                        : lastUserPreviewFromVisibleHistory(history),
                    date: "сейчас",
                  };
                }),
              }
            : p,
        ),
      };
    case "UPDATE_LOCAL_CHAT_MESSAGE":
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (p.id !== action.postId) return p;
          return {
            ...p,
            chats: p.chats.map((c) => {
              if (c.id !== action.chatId) return c;
              const history = applyUserMessageSave(c.history, action.path, action.text);
              return {
                ...c,
                history,
                preview: lastUserPreviewFromVisibleHistory(history),
                date: "сейчас",
              };
            }),
          };
        }),
      };
    case "DELETE_LOCAL_CHAT_MESSAGE":
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (p.id !== action.postId) return p;
          return {
            ...p,
            chats: p.chats.map((c) => {
              if (c.id !== action.chatId) return c;
              const history = removeMessageAtPath(c.history, action.path);
              return {
                ...c,
                history,
                preview: lastUserPreviewFromVisibleHistory(history),
                date: "сейчас",
              };
            }),
          };
        }),
      };
    case "DELETE_LOCAL_CHAT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? { ...p, chats: p.chats.filter((c) => c.id !== action.chatId) }
            : p,
        ),
        currentPostChatId:
          state.currentPostChatId === action.chatId ? null : state.currentPostChatId,
      };
    case "ADD_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId ? { ...p, notes: [...p.notes, action.note] } : p,
        ),
      };
    case "DELETE_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? { ...p, notes: p.notes.filter((n) => n.id !== action.noteId) }
            : p,
        ),
      };
    case "TOGGLE_POST_NOTE_AI":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                notes: p.notes.map((n) =>
                  n.id === action.noteId ? { ...n, ai: !n.ai } : n,
                ),
              }
            : p,
        ),
      };
    case "UPDATE_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                notes: p.notes.map((n) =>
                  n.id === action.noteId ? { ...n, ...action.patch } : n,
                ),
              }
            : p,
        ),
      };
    case "DELETE_POST": {
      const filtered = state.posts.filter((p) => p.id !== action.postId);
      return { ...state, posts: filtered, currentPostId: null };
    }
    case "ADD_POST_COMMENT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? { ...p, comments: [...(p.comments ?? []), action.comment] }
            : p,
        ),
      };
    case "REORDER_POSTS":
      return { ...state, posts: action.posts };
    case "ADD_GLOBAL_CHAT":
      return { ...state, globalChats: [action.chat, ...state.globalChats] };
    case "PUSH_GLOBAL_CHAT":
      return {
        ...state,
        globalChats: state.globalChats.map((c) => {
          if (c.id !== action.chatId) return c;
          const history = appendToActiveHistory(c.history, action.message);
          return {
            ...c,
            history,
            preview:
              action.message.role === "user" && action.message.text
                ? action.message.text
                : lastUserPreviewFromVisibleHistory(history),
            date: "сейчас",
          };
        }),
      };
    case "UPDATE_GLOBAL_CHAT_MESSAGE":
      return {
        ...state,
        globalChats: state.globalChats.map((c) => {
          if (c.id !== action.chatId) return c;
          const history = applyUserMessageSave(c.history, action.path, action.text);
          return {
            ...c,
            history,
            preview: lastUserPreviewFromVisibleHistory(history),
            date: "сейчас",
          };
        }),
      };
    case "DELETE_GLOBAL_CHAT_MESSAGE":
      return {
        ...state,
        globalChats: state.globalChats.map((c) => {
          if (c.id !== action.chatId) return c;
          const history = removeMessageAtPath(c.history, action.path);
          return {
            ...c,
            history,
            preview: lastUserPreviewFromVisibleHistory(history),
            date: "сейчас",
          };
        }),
      };
    case "DELETE_GLOBAL_CHAT":
      return {
        ...state,
        globalChats: state.globalChats.filter((c) => c.id !== action.chatId),
        currentGChatId:
          state.currentGChatId === action.chatId ? null : state.currentGChatId,
      };
    case "RENAME_GLOBAL_CHAT":
      return {
        ...state,
        globalChats: state.globalChats.map((c) =>
          c.id === action.chatId ? { ...c, title: action.title } : c,
        ),
      };
    case "RENAME_LOCAL_CHAT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                chats: p.chats.map((c) =>
                  c.id === action.chatId ? { ...c, title: action.title } : c,
                ),
              }
            : p,
        ),
      };
    case "UPDATE_GLOBAL_NOTES":
      return { ...state, globalNotes: action.notes };
    case "UPSERT_GLOBAL_NOTE": {
      const exists = state.globalNotes.find((n) => n.id === action.note.id);
      const notes = exists
        ? state.globalNotes.map((n) => (n.id === action.note.id ? action.note : n))
        : [action.note, ...state.globalNotes];
      return { ...state, globalNotes: notes };
    }
    case "DELETE_GLOBAL_NOTE":
      return {
        ...state,
        globalNotes: state.globalNotes.filter((n) => n.id !== action.noteId),
      };
    case "SET_AI_VARIANT": {
      const applyVariant = (hist: ChatMessage[]) =>
        mapMessageAtPath(hist, action.path, (m) => ({ ...m, selectedVariant: action.variantIdx }));
      if (action.scope === "gchat") {
        return {
          ...state,
          globalChats: state.globalChats.map((c) =>
            c.id === action.entityId ? { ...c, history: applyVariant(c.history) } : c,
          ),
        };
      }
      return {
        ...state,
        posts: state.posts.map((p) => ({
          ...p,
          chats: p.chats.map((c) =>
            c.id === action.entityId ? { ...c, history: applyVariant(c.history) } : c,
          ),
        })),
      };
    }
    case "SET_USER_BRANCH": {
      const applyBranch = (hist: ChatMessage[]) =>
        setActiveUserBranch(hist, action.path, action.branchIdx);
      if (action.scope === "gchat") {
        return {
          ...state,
          globalChats: state.globalChats.map((c) => {
            if (c.id !== action.entityId) return c;
            const history = applyBranch(c.history);
            return {
              ...c,
              history,
              preview: lastUserPreviewFromVisibleHistory(history),
              date: "сейчас",
            };
          }),
        };
      }
      const postId = action.postId ?? 0;
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id !== postId
            ? p
            : {
                ...p,
                chats: p.chats.map((c) => {
                  if (c.id !== action.entityId) return c;
                  const history = applyBranch(c.history);
                  return {
                    ...c,
                    history,
                    preview: lastUserPreviewFromVisibleHistory(history),
                    date: "сейчас",
                  };
                }),
              },
        ),
      };
    }
    case "UPDATE_CHANNEL_PROFILE":
      return { ...state, channelProfileConfig: action.config };
    case "UPDATE_AI_CONFIG":
      return { ...state, aiProfileConfig: action.config };
    case "UPDATE_TELEGRAM_CONFIG":
      return { ...state, telegramProfileConfig: action.config };
    default:
      return state;
  }
}

function buildInitialAiSnapshot() {
  return JSON.stringify({
    llmModels: initialAiProfileConfig.llmModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    webSearchModels: initialAiProfileConfig.webSearchModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    orchestratorModels: initialAiProfileConfig.orchestratorModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    webReasonerModels: initialAiProfileConfig.webReasonerModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    ragReasonerModels: initialAiProfileConfig.ragReasonerModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    multiResponseEnabled: !!initialAiProfileConfig.multiResponseEnabled,
  });
}

function buildInitialTelegramSnapshot() {
  const cfg = initialTelegramProfileConfig;
  return JSON.stringify({
    apiId: cfg.apiId || "",
    apiHash: cfg.apiHash || "",
    phone: cfg.phone || "",
    sessionName: cfg.sessionName || "",
    channel: cfg.channel || "",
    syncMode: cfg.syncMode || "",
  });
}

const initialState: State = {
  posts: initialPosts,
  globalChats: initialGlobalChats,
  globalNotes: initialGlobalNotes,
  channelProfileConfig: initialChannelProfileConfig,
  aiProfileConfig: initialAiProfileConfig,
  telegramProfileConfig: initialTelegramProfileConfig,
  pinnedPostIds: initialPinnedPostIds,

  screen: "home",
  currentPostId: null,
  currentPostChatId: null,
  postMode: "chat",
  postViewStack: [],
  isEditing: false,
  currentGChatId: null,
  currentNote: null,
  noteMode: "view",
  noteFrom: "notes",
  noteSavedSnapshot: "",

  chatsTab: "all",
  noteScope: "all",
  noteFilter: "all",

  composerTargets: {
    home: { llmId: "llm-1", webId: "web-1" },
    gchat: { llmId: "llm-1", webId: "web-1" },
    post: { llmId: "llm-1", webId: "web-1" },
  },

  systemPromptSavedSnapshot: initialAiProfileConfig.systemPrompt,
  modelSettingsSavedSnapshot: buildInitialAiSnapshot(),
  telegramSettingsSavedSnapshot: buildInitialTelegramSnapshot(),
  channelProfileSavedSnapshot: JSON.stringify(initialChannelProfileConfig),

  theme: "dark",
};

export type DirtyKey = "note" | "profile-channel" | "profile-ai" | "profile-prompt" | "profile-telegram";

type AppContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  navigate: (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => void;
  navigateBack: (fallback?: ScreenId) => void;
  navigateWithState: (patch: Partial<State>) => void;
  /** Записать текущий маршрут в стек без смены экрана (например, перед несколькими dispatch подряд). */
  pushRouteSnapshot: () => void;
  goHome: () => void;
  openPost: (id: number | "new") => void;
  openPostComments: (id: number) => void;
  openGChat: (id: string) => void;
  sendHome: (text: string) => boolean;
  sendGChat: (text: string) => boolean;
  sendPost: (text: string) => boolean;
  hasLlmForSend: (scope: ComposerScope) => boolean;
  setComposerLlm: (scope: ComposerScope, llmId: string) => void;
  setComposerWeb: (scope: ComposerScope, webId: string) => void;
  multiResponsePairs: () => { id: string; llmId: string; webId: string; label: string }[];
  llmLabel: (id: string) => string;
  webLabel: (id: string) => string;

  setDirty: (key: DirtyKey, dirty: boolean) => void;
  registerNotePersist: (fn: (() => void) | null) => void;
  noteDirty: boolean;
  profileChannelDirty: boolean;
  profileSettingsDirty: boolean;
  canLeaveCurrentScreen: (next: ScreenId) => boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const navStackRef = useRef<RouteSnapshot[]>([]);
  const notePersistRef = useRef<(() => void) | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dirtyMap, setDirtyMap] = useState<Record<DirtyKey, boolean>>({
    note: false,
    "profile-channel": false,
    "profile-ai": false,
    "profile-prompt": false,
    "profile-telegram": false,
  });

  const setDirty = useCallback((key: DirtyKey, dirty: boolean) => {
    setDirtyMap((prev) => (prev[key] === dirty ? prev : { ...prev, [key]: dirty }));
  }, []);

  const registerNotePersist = useCallback((fn: (() => void) | null) => {
    notePersistRef.current = fn;
  }, []);

  const noteDirty = dirtyMap.note;
  const profileChannelDirty = dirtyMap["profile-channel"];
  const profileSettingsDirty =
    dirtyMap["profile-ai"] ||
    dirtyMap["profile-prompt"] ||
    dirtyMap["profile-telegram"];
  const profileDirty = profileChannelDirty || profileSettingsDirty;

  const canLeaveCurrentScreen = useCallback(
    (next: ScreenId): boolean => {
      if (state.screen === "note" && next !== "note") {
        if (state.currentNote?.isNew) {
          if (noteDirty) notePersistRef.current?.();
          return true;
        }
        if (noteDirty) {
          return window.confirm(
            "У вас есть несохранённые изменения в заметке. Покинуть страницу без сохранения?",
          );
        }
      }
      if (state.screen === "profile" && next !== "profile" && profileDirty) {
        return window.confirm(
          "Есть несохранённые изменения в профиле. Уйти без сохранения?",
        );
      }
      return true;
    },
    [state.screen, state.currentNote, noteDirty, profileDirty],
  );

  const navigate = useCallback(
    (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => {
      if (!canLeaveCurrentScreen(screen)) return;
      if (screen === stateRef.current.screen) return;
      setMobileSidebarOpen(false);
      if (opts?.clearHistory) {
        navStackRef.current = [];
      }
      if (!opts?.skipHistory) {
        navStackRef.current.push(captureRouteState(stateRef.current));
      }
      dispatch({ type: "SET_SCREEN", screen });
    },
    [canLeaveCurrentScreen],
  );

  const navigateBack = useCallback(
    (fallback?: ScreenId) => {
      const snap = navStackRef.current.pop();
      if (!snap) {
        const to = fallback ?? "home";
        if (!canLeaveCurrentScreen(to)) return;
        setMobileSidebarOpen(false);
        dispatch({ type: "SET_SCREEN", screen: to });
        return;
      }
      if (!canLeaveCurrentScreen(snap.screen)) {
        navStackRef.current.push(snap);
        return;
      }
      setMobileSidebarOpen(false);
      dispatch({ type: "SET_STATE", patch: snap });
    },
    [canLeaveCurrentScreen],
  );

  const navigateWithState = useCallback(
    (patch: Partial<State>) => {
      const nextScreen = patch.screen ?? stateRef.current.screen;
      if (!canLeaveCurrentScreen(nextScreen)) return;
      setMobileSidebarOpen(false);
      navStackRef.current.push(captureRouteState(stateRef.current));
      dispatch({ type: "SET_STATE", patch });
    },
    [canLeaveCurrentScreen],
  );

  const pushRouteSnapshot = useCallback(() => {
    navStackRef.current.push(captureRouteState(stateRef.current));
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!noteDirty && !profileDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [noteDirty, profileDirty]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("tg-demo-theme");
      if (stored === "light" || stored === "system" || stored === "dark") {
        if (stored !== state.theme) {
          dispatch({ type: "SET_STATE", patch: { theme: stored } });
        }
      }
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", state.theme);
      window.localStorage.setItem("tg-demo-theme", state.theme);
    } catch {}
  }, [state.theme]);

  const goHome = useCallback(() => navigate("home"), [navigate]);

  const openPost = useCallback(
    (id: number | "new") => {
      if (!canLeaveCurrentScreen("post")) return;
      setMobileSidebarOpen(false);
      navStackRef.current.push(captureRouteState(stateRef.current));
      if (id === "new") {
        const newPost: Post = {
          id: Date.now(),
          status: "draft",
          created: "только что",
          rubric: null,
          text: "",
          notes: [],
          chats: [],
        };
        dispatch({ type: "UPDATE_POSTS", posts: [...stateRef.current.posts, newPost] });
        dispatch({
          type: "SET_STATE",
          patch: {
            currentPostId: newPost.id,
            currentPostChatId: null,
            postMode: "chat",
            postViewStack: [],
            isEditing: false,
            screen: "post",
          },
        });
        return;
      }
      dispatch({
        type: "SET_STATE",
        patch: {
          currentPostId: id,
          currentPostChatId: null,
          postMode: "chat",
          postViewStack: [],
          isEditing: false,
          screen: "post",
        },
      });
    },
    [canLeaveCurrentScreen],
  );

  const openPostComments = useCallback(
    (id: number) => {
      if (!canLeaveCurrentScreen("post")) return;
      setMobileSidebarOpen(false);
      navStackRef.current.push(captureRouteState(stateRef.current));
      dispatch({
        type: "SET_STATE",
        patch: {
          currentPostId: id,
          currentPostChatId: null,
          postMode: "comments",
          postViewStack: [],
          isEditing: false,
          screen: "post",
        },
      });
    },
    [canLeaveCurrentScreen],
  );

  const openGChat = useCallback(
    (id: string) => {
      if (!canLeaveCurrentScreen("gchat")) return;
      setMobileSidebarOpen(false);
      navStackRef.current.push(captureRouteState(stateRef.current));
      dispatch({ type: "SET_STATE", patch: { currentGChatId: id, screen: "gchat" } });
    },
    [canLeaveCurrentScreen],
  );

  const llmLabel = useCallback(
    (id: string) => {
      const model = state.aiProfileConfig.llmModels.find((m) => m.id === id);
      return model ? `${model.provider} / ${model.model || "модель"}` : "LLM не выбрана";
    },
    [state.aiProfileConfig.llmModels],
  );

  const webLabel = useCallback(
    (id: string) => {
      if (!id) return "Нет";
      const model = state.aiProfileConfig.webSearchModels.find((m) => m.id === id);
      return model
        ? formatWebSearchComposerLabel(model.provider, model.model || "модель")
        : "Нет";
    },
    [state.aiProfileConfig.webSearchModels],
  );

  const multiResponsePairs = useCallback(
    () =>
      buildMultiResponsePairs(
        state.aiProfileConfig.llmModels,
        state.aiProfileConfig.webSearchModels,
      ),
    [state.aiProfileConfig],
  );

  const hasLlmForSend = useCallback(
    (scope: ComposerScope) => {
      const cfg = state.aiProfileConfig;
      if (cfg.multiResponseEnabled) {
        return cfg.llmModels.some(
          (m) => m.provider && m.model && m.active && m.includeInMulti,
        );
      }
      const target = state.composerTargets[scope];
      if (!target?.llmId) return false;
      return cfg.llmModels.some(
        (m) => m.id === target.llmId && m.provider && m.model && m.active,
      );
    },
    [state.aiProfileConfig, state.composerTargets],
  );

  const setComposerLlm = useCallback(
    (scope: ComposerScope, llmId: string) => {
      const prev = state.composerTargets[scope];
      let webId = prev.webId;
      const llm = state.aiProfileConfig.llmModels.find((m) => m.id === llmId);
      const web = state.aiProfileConfig.webSearchModels.find((m) => m.id === webId);
      if (web && isOpenAiWebSearchModel(web.provider, web.model) && !isWebSearchVisibleForLlm(web, llm)) {
        webId = "";
      }
      dispatch({
        type: "SET_STATE",
        patch: {
          composerTargets: {
            ...state.composerTargets,
            [scope]: { ...prev, llmId, webId },
          },
        },
      });
    },
    [state.composerTargets, state.aiProfileConfig],
  );

  const setComposerWeb = useCallback((scope: ComposerScope, webId: string) => {
    dispatch({
      type: "SET_STATE",
      patch: {
        composerTargets: {
          ...state.composerTargets,
          [scope]: { ...state.composerTargets[scope], webId },
        },
      },
    });
  }, [state.composerTargets]);

  const buildAiMessage = useCallback(
    (baseReply: string, scope: ComposerScope): ChatMessage => {
      const cfg = state.aiProfileConfig;
      if (cfg.multiResponseEnabled) {
        const pairs = multiResponsePairs();
        if (pairs.length > 0) {
          const variants: AiVariant[] = pairs.map((pair, idx) => {
            const llmModel = cfg.llmModels.find((m) => m.id === pair.llmId);
            const webModel = pair.webId ? cfg.webSearchModels.find((m) => m.id === pair.webId) : undefined;
            const llmCap = llmModel ? `${llmModel.provider}/${llmModel.model}` : "";
            const webCap = webModel
              ? formatWebSearchComposerLabel(webModel.provider, webModel.model)
              : "";
            const label = webCap ? `${llmCap} + ${webCap}` : llmCap;
            return {
              key: pair.id,
              label,
              llmCaption: llmCap,
              webCaption: webCap || undefined,
              text: `${baseReply}\n\n— ${label}\n${VARIANT_TAILS[idx % VARIANT_TAILS.length]}`,
            };
          });
          return { role: "ai", variants, selectedVariant: 0, mode: "multi" };
        }
      }
      const target = state.composerTargets[scope];
      const llm = llmLabel(target?.llmId || "");
      const web = webLabel(target?.webId || "");
      const label = target?.webId ? `${llm} + ${web}` : llm;
      return {
        role: "ai",
        text: `${baseReply}\n\n— ${label}\n${VARIANT_TAILS[0]}`,
        mode: "single",
        targetLabel: label,
        llmLabel: llm,
        webLabel: web,
      };
    },
    [state.aiProfileConfig, state.composerTargets, multiResponsePairs, llmLabel, webLabel],
  );

  const assertLlm = useCallback(
    (scope: ComposerScope) => {
      if (hasLlmForSend(scope)) return true;
      if (typeof window !== "undefined") window.alert("Активируйте LLM модель.");
      return false;
    },
    [hasLlmForSend],
  );

  const sendHome = useCallback(
    (text: string) => {
      if (!text.trim()) return false;
      if (!assertLlm("home")) return false;
      if (!canLeaveCurrentScreen("gchat")) return false;
      setMobileSidebarOpen(false);
      navStackRef.current.push(captureRouteState(stateRef.current));
      const id = "gc" + Date.now();
      const newChat: GlobalChat = {
        id,
        title: truncate(text, 40),
        preview: text,
        date: "сейчас",
        history: [{ role: "user", text }],
      };
      dispatch({ type: "ADD_GLOBAL_CHAT", chat: newChat });
      dispatch({ type: "SET_STATE", patch: { currentGChatId: id, screen: "gchat" } });
      setTimeout(() => {
        const reply = buildAiMessage(getGlobalReply(text), "home");
        dispatch({ type: "PUSH_GLOBAL_CHAT", chatId: id, message: reply });
      }, 900);
      return true;
    },
    [assertLlm, buildAiMessage, canLeaveCurrentScreen],
  );

  const sendGChat = useCallback(
    (text: string) => {
      if (!text.trim() || !state.currentGChatId) return false;
      if (!assertLlm("gchat")) return false;
      const chatId = state.currentGChatId;
      dispatch({ type: "PUSH_GLOBAL_CHAT", chatId, message: { role: "user", text } });
      setTimeout(() => {
        const reply = buildAiMessage(getGlobalReply(text), "gchat");
        dispatch({ type: "PUSH_GLOBAL_CHAT", chatId, message: reply });
      }, 900);
      return true;
    },
    [state.currentGChatId, assertLlm, buildAiMessage],
  );

  const sendPost = useCallback(
    (text: string) => {
      if (!text.trim() || !state.currentPostId) return false;
      if (!assertLlm("post")) return false;
      const postId = state.currentPostId;
      let chatId = state.currentPostChatId;
      if (chatId == null) {
        chatId = Date.now();
        const newChat: LocalChat = {
          id: chatId,
          title: truncate(text, 40),
          preview: text,
          date: "сейчас",
          history: [{ role: "user", text }],
        };
        dispatch({ type: "ADD_LOCAL_CHAT", postId, chat: newChat });
        dispatch({ type: "SET_STATE", patch: { currentPostChatId: chatId } });
      } else {
        dispatch({
          type: "PUSH_LOCAL_CHAT_MSG",
          postId,
          chatId,
          message: { role: "user", text },
        });
      }
      const replyChatId = chatId;
      setTimeout(() => {
        const reply = buildAiMessage(getPostReply(text), "post");
        dispatch({
          type: "PUSH_LOCAL_CHAT_MSG",
          postId,
          chatId: replyChatId,
          message: reply,
        });
      }, 800);
      return true;
    },
    [state.currentPostId, state.currentPostChatId, assertLlm, buildAiMessage],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      navigate,
      navigateBack,
      navigateWithState,
      pushRouteSnapshot,
      goHome,
      openPost,
      openPostComments,
      openGChat,
      sendHome,
      sendGChat,
      sendPost,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      multiResponsePairs,
      llmLabel,
      webLabel,
      setDirty,
      registerNotePersist,
      noteDirty,
      profileChannelDirty,
      profileSettingsDirty,
      canLeaveCurrentScreen,
    }),
    [
      state,
      mobileSidebarOpen,
      navigate,
      navigateBack,
      navigateWithState,
      pushRouteSnapshot,
      goHome,
      openPost,
      openPostComments,
      openGChat,
      sendHome,
      sendGChat,
      sendPost,
      hasLlmForSend,
      setComposerLlm,
      setComposerWeb,
      multiResponsePairs,
      llmLabel,
      webLabel,
      setDirty,
      registerNotePersist,
      noteDirty,
      profileChannelDirty,
      profileSettingsDirty,
      canLeaveCurrentScreen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export type { State as AppState, Action as AppAction };

export function postById(state: State, id: number | null): Post | null {
  if (id == null) return null;
  return state.posts.find((p) => p.id === id) || null;
}

export function globalChatById(state: State, id: string | null): GlobalChat | null {
  if (id == null) return null;
  return state.globalChats.find((c) => c.id === id) || null;
}

export type { NoteFile };
