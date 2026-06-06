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
import type { DomainState } from "@/app/model/store/domain/types";

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

export type ComposerTargets = Record<ComposerScope, ComposerTarget>;
