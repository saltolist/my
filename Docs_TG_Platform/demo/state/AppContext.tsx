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
import { usePathname, useRouter } from "next/navigation";
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
import { resolvePostViewMode } from "@/lib/postView";
import {
  getParentPath,
  routes,
  screenFromPath,
  screenToHref,
  statePatchToHref,
} from "@/lib/routes";
import { POST_NEW_SLUG } from "@/lib/staticParams";
import { postTitle, truncate } from "@/lib/helpers";
import {
  appendToActiveHistory,
  applyOmnichannelUserMessageSave,
  applyUserMessageSave,
  countVisibleChatMessages,
  lastUserPreviewFromVisibleHistory,
  mapMessageAtPath,
  removeMessageAtPath,
  setActiveUserBranch,
} from "@/lib/chatPaths";
import { isOmnichannelChatId, syncOmnichannelGlobalChats } from "@/lib/omnichannel";
import { buildProfileDiscardPatch } from "@/lib/profileDiscard";
import {
  FEED_POST_WIDTH_STORAGE_KEY,
  readStoredFeedPostWidth,
  type FeedPostWidth,
} from "@/lib/feedPostWidth";
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
  /** Ширина карточки поста в ленте и на экране поста (десктоп). */
  feedPostWidth: FeedPostWidth;
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
    isEditing: s.screen === "post" && s.isEditing ? false : s.isEditing,
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

function withTelegramOmnichannelSync(state: State, config: TelegramProfileConfig): State {
  const globalChats = syncOmnichannelGlobalChats(state.globalChats, config);
  const omni = globalChats.find((c) => isOmnichannelChatId(c.id));
  const botMessageCount = omni ? countVisibleChatMessages(omni.history) : 0;
  const currentGChatId =
    config.botStatus !== "connected" && isOmnichannelChatId(state.currentGChatId)
      ? null
      : state.currentGChatId;
  return {
    ...state,
    telegramProfileConfig: { ...config, botMessageCount },
    globalChats,
    currentGChatId,
  };
}

function patchGlobalChatHistory(
  state: State,
  chatId: string,
  history: ChatMessage[],
): State {
  const globalChats = state.globalChats.map((c) =>
    c.id === chatId
      ? {
          ...c,
          history,
          preview: lastUserPreviewFromVisibleHistory(history),
          date: "сейчас",
        }
      : c,
  );
  if (!globalChats.some((c) => c.id === chatId)) return state;
  if (!isOmnichannelChatId(chatId)) return { ...state, globalChats };
  return {
    ...state,
    globalChats,
    telegramProfileConfig: {
      ...state.telegramProfileConfig,
      botMessageCount: countVisibleChatMessages(history),
    },
  };
}

function applyStatePatch(state: State, patch: Partial<State>): State {
  const next = { ...state, ...patch };
  if (next.screen !== "post") {
    next.isEditing = false;
  }
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SCREEN":
      return applyStatePatch(state, { screen: action.screen });
    case "SET_STATE":
      return applyStatePatch(state, action.patch);
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
    case "PUSH_GLOBAL_CHAT": {
      const chat = state.globalChats.find((c) => c.id === action.chatId);
      if (!chat) return state;
      const history = appendToActiveHistory(chat.history, action.message);
      return patchGlobalChatHistory(state, action.chatId, history);
    }
    case "UPDATE_GLOBAL_CHAT_MESSAGE": {
      const chat = state.globalChats.find((c) => c.id === action.chatId);
      if (!chat) return state;
      const history = isOmnichannelChatId(action.chatId)
        ? applyOmnichannelUserMessageSave(chat.history, action.path, action.text)
        : applyUserMessageSave(chat.history, action.path, action.text);
      return patchGlobalChatHistory(state, action.chatId, history);
    }
    case "DELETE_GLOBAL_CHAT_MESSAGE": {
      const chat = state.globalChats.find((c) => c.id === action.chatId);
      if (!chat) return state;
      const history = removeMessageAtPath(chat.history, action.path);
      return patchGlobalChatHistory(state, action.chatId, history);
    }
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
      return withTelegramOmnichannelSync(state, action.config);
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
    botApiToken: cfg.botApiToken || "",
    botStatus: cfg.botStatus,
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
  feedPostWidth: 500,
};

export type DirtyKey = "note" | "profile-channel" | "profile-ai" | "profile-prompt" | "profile-telegram";

const POST_EDIT_LEAVE_MSG =
  "Вы редактируете пост. Покинуть страницу без сохранения?";
const USER_MSG_EDIT_LEAVE_MSG =
  "Вы редактируете сообщение. Покинуть без сохранения?";

type UserMessageEditSession = { discard: () => void };

function withPostEditDiscarded(cur: State, patch: Partial<State>): Partial<State> {
  const nextScreen = patch.screen ?? cur.screen;
  if (cur.screen === "post" && cur.isEditing && nextScreen !== "post") {
    return { ...patch, isEditing: false };
  }
  return patch;
}

function withProfileEditsDiscarded(cur: State, patch: Partial<State>): Partial<State> {
  const nextScreen = patch.screen ?? cur.screen;
  if (cur.screen !== "profile" || nextScreen === "profile") return patch;
  return { ...patch, ...buildProfileDiscardPatch(cur) };
}

function withNoteEditsDiscarded(cur: State, patch: Partial<State>): Partial<State> {
  const nextScreen = patch.screen ?? cur.screen;
  if (cur.screen !== "note" || nextScreen === "note" || !cur.currentNote) return patch;
  return { ...patch, currentNote: null, noteMode: "view" };
}

function applyTelegramSyncToPatch(cur: State, patch: Partial<State>): Partial<State> {
  if (!patch.telegramProfileConfig) return patch;
  const synced = withTelegramOmnichannelSync(
    { ...cur, ...patch } as State,
    patch.telegramProfileConfig,
  );
  return {
    ...patch,
    telegramProfileConfig: synced.telegramProfileConfig,
    globalChats: synced.globalChats,
    currentGChatId: synced.currentGChatId,
  };
}

function buildNavigationPatch(cur: State, patch: Partial<State>): Partial<State> {
  return applyTelegramSyncToPatch(
    cur,
    withNoteEditsDiscarded(
      cur,
      withProfileEditsDiscarded(cur, withPostEditDiscarded(cur, patch)),
    ),
  );
}

const PROFILE_DIRTY_KEYS: DirtyKey[] = [
  "profile-channel",
  "profile-ai",
  "profile-prompt",
  "profile-telegram",
];

type AppContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  navigate: (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => void;
  navigateBack: (fallback?: ScreenId) => void;
  navigateWithState: (patch: Partial<State>) => void;
  /** Переход по URL (с проверкой несохранённых правок). */
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  goHome: () => void;
  openPost: (id: number | "new") => void;
  /** Вкладки поста (заметки / чаты / комментарии) без смены URL. */
  setPostView: (mode: PostMode, chatId?: number | null) => void;
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
  /** Подтверждение ухода из режима редактирования поста (вкладки и стек внутри поста). */
  confirmDiscardPostEdit: () => boolean;
  registerUserMessageEdit: (discard: () => void) => void;
  unregisterUserMessageEdit: (discard: () => void) => void;
  /** Пост и/или сообщение: подтверждение без сброса (сброс — discardPendingEdits). */
  confirmDiscardAnyEdit: () => boolean;
  discardPendingEdits: () => void;
  /** Сброс несохранённых правок профиля к последним сохранённым снимкам. */
  discardProfileEdits: () => void;
  setFeedPostWidth: (width: FeedPostWidth) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const notePersistRef = useRef<(() => void) | null>(null);
  const userMessageEditRef = useRef<UserMessageEditSession | null>(null);
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
      if (state.screen === "post" && state.isEditing && next !== "post") {
        if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
      }
      if (userMessageEditRef.current) {
        if (!window.confirm(USER_MSG_EDIT_LEAVE_MSG)) return false;
      }
      return true;
    },
    [state.screen, state.currentNote, noteDirty, profileDirty, state.isEditing],
  );

  const discardUserMessageEditSession = useCallback(() => {
    const session = userMessageEditRef.current;
    if (!session) return;
    session.discard();
    userMessageEditRef.current = null;
  }, []);

  const registerUserMessageEdit = useCallback((discard: () => void) => {
    userMessageEditRef.current = { discard };
  }, []);

  const unregisterUserMessageEdit = useCallback((discard: () => void) => {
    if (userMessageEditRef.current?.discard === discard) {
      userMessageEditRef.current = null;
    }
  }, []);

  const confirmDiscardPostEdit = useCallback((): boolean => {
    const cur = stateRef.current;
    if (cur.screen === "post" && cur.isEditing) {
      if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
    }
    return true;
  }, []);

  const confirmDiscardUserMessageEdit = useCallback((): boolean => {
    if (!userMessageEditRef.current) return true;
    if (!window.confirm(USER_MSG_EDIT_LEAVE_MSG)) return false;
    return true;
  }, []);

  const confirmDiscardAnyEdit = useCallback((): boolean => {
    if (!confirmDiscardPostEdit()) return false;
    if (!confirmDiscardUserMessageEdit()) return false;
    return true;
  }, [confirmDiscardPostEdit, confirmDiscardUserMessageEdit]);

  const discardPendingEdits = useCallback(() => {
    discardUserMessageEditSession();
  }, [discardUserMessageEditSession]);

  const clearProfileDirtyFlags = useCallback(() => {
    setDirtyMap((prev) => {
      const next = { ...prev };
      for (const key of PROFILE_DIRTY_KEYS) next[key] = false;
      return next;
    });
  }, []);

  const discardProfileEdits = useCallback(() => {
    const cur = stateRef.current;
    dispatch({
      type: "SET_STATE",
      patch: applyTelegramSyncToPatch(cur, buildProfileDiscardPatch(cur)),
    });
    clearProfileDirtyFlags();
  }, [clearProfileDirtyFlags]);

  const commitNavigationPatch = useCallback(
    (patch: Partial<State>) => {
      const cur = stateRef.current;
      const nextScreen = patch.screen ?? cur.screen;
      const leavingProfile = cur.screen === "profile" && nextScreen !== "profile";
      const leavingNote = cur.screen === "note" && nextScreen !== "note";
      dispatch({ type: "SET_STATE", patch: buildNavigationPatch(cur, patch) });
      if (leavingProfile) clearProfileDirtyFlags();
      if (leavingNote) setDirty("note", false);
    },
    [clearProfileDirtyFlags, setDirty],
  );

  const goToHref = useCallback(
    (href: string, opts?: { replace?: boolean }): boolean => {
      const pathOnly = href.split("?")[0] ?? href;
      const nextScreen = screenFromPath(pathOnly);
      if (!canLeaveCurrentScreen(nextScreen)) return false;
      setMobileSidebarOpen(false);
      discardPendingEdits();
      if (opts?.replace) router.replace(href);
      else router.push(href);
      return true;
    },
    [canLeaveCurrentScreen, discardPendingEdits, router],
  );

  const navigate = useCallback(
    (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => {
      void opts?.clearHistory;
      const href = screenToHref(screen);
      const curPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
      if (href === curPath && screen === stateRef.current.screen) return;
      goToHref(href, { replace: opts?.skipHistory });
    },
    [goToHref, pathname],
  );

  const navigateBack = useCallback(
    (fallback?: ScreenId) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      setMobileSidebarOpen(false);
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      const parent = getParentPath(pathname);
      if (parent) {
        router.push(parent);
        return;
      }
      const to = screenToHref(fallback ?? "home");
      if (!canLeaveCurrentScreen(fallback ?? "home")) return;
      router.push(to);
    },
    [
      canLeaveCurrentScreen,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      pathname,
      router,
    ],
  );

  const navigateWithState = useCallback(
    (patch: Partial<State>) => {
      const nextScreen = patch.screen ?? stateRef.current.screen;
      if (!canLeaveCurrentScreen(nextScreen)) return;
      const href = statePatchToHref(patch, stateRef.current);
      const routeOnly =
        patch.screen != null ||
        patch.currentPostId != null ||
        patch.currentGChatId != null ||
        patch.postMode != null ||
        patch.currentNote != null;
      if (!href || !routeOnly) {
        setMobileSidebarOpen(false);
        discardPendingEdits();
        commitNavigationPatch(patch);
        return;
      }
      setMobileSidebarOpen(false);
      discardPendingEdits();
      router.push(href);
    },
    [canLeaveCurrentScreen, commitNavigationPatch, discardPendingEdits, router],
  );

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const postEditing = stateRef.current.screen === "post" && stateRef.current.isEditing;
      const msgEditing = !!userMessageEditRef.current;
      if (!noteDirty && !profileDirty && !postEditing && !msgEditing) return;
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
      const feedW = readStoredFeedPostWidth();
      if (feedW !== state.feedPostWidth) {
        dispatch({ type: "SET_STATE", patch: { feedPostWidth: feedW } });
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

  useEffect(() => {
    try {
      window.localStorage.setItem(FEED_POST_WIDTH_STORAGE_KEY, String(state.feedPostWidth));
    } catch {}
  }, [state.feedPostWidth]);

  const setFeedPostWidth = useCallback((width: FeedPostWidth) => {
    dispatch({ type: "SET_STATE", patch: { feedPostWidth: width } });
  }, []);

  const goHome = useCallback(() => navigate("home"), [navigate]);

  const openPost = useCallback(
    (id: number | "new") => {
      const href = id === "new" ? routes.post(POST_NEW_SLUG) : routes.post(id);
      goToHref(href);
    },
    [goToHref],
  );

  const setPostView = useCallback(
    (nextMode: PostMode, nextChatId: number | null = null) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      const cur = stateRef.current;
      const postMode = resolvePostViewMode(cur.postMode, nextMode);
      let chatId: number | null = null;
      if (postMode === "chat") {
        chatId = nextMode === "chat" ? nextChatId : cur.currentPostChatId;
      }
      dispatch({
        type: "SET_STATE",
        patch: {
          screen: "post",
          postMode,
          currentPostChatId: chatId,
          postViewStack: [],
          isEditing: false,
        },
      });
    },
    [confirmDiscardAnyEdit, discardPendingEdits, dispatch],
  );

  const openPostComments = useCallback(
    (id: number) => {
      const cur = stateRef.current;
      if (cur.screen !== "post" || cur.currentPostId !== id) {
        if (!goToHref(routes.post(id))) return;
      }
      setPostView("comments", null);
    },
    [goToHref, setPostView],
  );

  const openGChat = useCallback(
    (id: string) => {
      goToHref(routes.gchat(id));
    },
    [goToHref],
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
      const id = "gc" + Date.now();
      const newChat: GlobalChat = {
        id,
        title: truncate(text, 40),
        preview: text,
        date: "сейчас",
        history: [{ role: "user", text }],
      };
      dispatch({ type: "ADD_GLOBAL_CHAT", chat: newChat });
      goToHref(routes.gchat(id));
      setTimeout(() => {
        const reply = buildAiMessage(getGlobalReply(text), "home");
        dispatch({ type: "PUSH_GLOBAL_CHAT", chatId: id, message: reply });
      }, 900);
      return true;
    },
    [assertLlm, buildAiMessage, canLeaveCurrentScreen, goToHref],
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
          ai: true,
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
      goToHref,
      goHome,
      openPost,
      setPostView,
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
      confirmDiscardPostEdit,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
      setFeedPostWidth,
    }),
    [
      state,
      mobileSidebarOpen,
      navigate,
      navigateBack,
      navigateWithState,
      goToHref,
      goHome,
      openPost,
      setPostView,
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
      confirmDiscardPostEdit,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
      setFeedPostWidth,
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
