import {
  initialAiProfileConfig,
  initialChannelProfileConfig,
  initialGlobalChats,
  initialGlobalNotes,
  initialPinnedPostIds,
  initialPosts,
  initialTelegramProfileConfig,
} from "@/shared/data/demo-data";
import {
  appendToActiveHistory,
  applyOmnichannelUserMessageSave,
  applyUserMessageSave,
  lastUserPreviewFromVisibleHistory,
  mapMessageAtPath,
  removeMessageAtPath,
  setActiveUserBranch,
} from "@/shared/lib/chatPaths";
import { isOmnichannelChatId } from "@/shared/lib/omnichannel";
import type {
  AiProfileConfig,
  ChannelProfileConfig,
  ChatMessage,
  ComposerScope,
  ComposerTarget,
  GlobalChat,
  GlobalNote,
  LocalChat,
  LocalNote,
  Post,
  PostComment,
  TelegramProfileConfig,
} from "@/shared/types";
import { patchGlobalChatHistory, withTelegramDomainSync } from "@/app/model/store/domain/helpers";
import type { DomainState } from "@/app/model/store/domain/types";

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

export const initialDomainState: DomainState = {
  posts: initialPosts,
  globalChats: initialGlobalChats,
  globalNotes: initialGlobalNotes,
  channelProfileConfig: initialChannelProfileConfig,
  aiProfileConfig: initialAiProfileConfig,
  telegramProfileConfig: initialTelegramProfileConfig,
  pinnedPostIds: initialPinnedPostIds,
  composerTargets: {
    home: { llmId: "llm-1", webId: "web-1" },
    gchat: { llmId: "llm-1", webId: "web-1" },
    post: { llmId: "llm-1", webId: "web-1" },
  },
  systemPromptSavedSnapshot: initialAiProfileConfig.systemPrompt,
  modelSettingsSavedSnapshot: buildInitialAiSnapshot(),
  telegramSettingsSavedSnapshot: buildInitialTelegramSnapshot(),
  channelProfileSavedSnapshot: JSON.stringify(initialChannelProfileConfig),
};

export type DomainAction =
  | { type: "SET_DOMAIN"; patch: Partial<DomainState> }
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

export function domainReducer(state: DomainState, action: DomainAction): DomainState {
  switch (action.type) {
    case "SET_DOMAIN":
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
    case "DELETE_POST":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.postId) };
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
      return { ...state, ...withTelegramDomainSync(state, action.config) };
    default:
      return state;
  }
}

export type ComposerTargets = Record<ComposerScope, ComposerTarget>;
