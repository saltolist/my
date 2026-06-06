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
import { patchGlobalChatHistory } from "@/app/model/store/domain/helpers";
import type { ChatMessage } from "@/shared/types";
import type { DomainAction } from "@/app/model/store/domain/actions";
import type { DomainState } from "@/app/model/store/domain/types";

export function handleChatsAction(state: DomainState, action: DomainAction): DomainState | null {
  switch (action.type) {
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
    default:
      return null;
  }
}
