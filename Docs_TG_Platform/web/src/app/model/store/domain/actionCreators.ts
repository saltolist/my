import type {
  AiProfileConfig,
  ChannelProfileConfig,
  ChatMessage,
  GlobalChat,
  GlobalNote,
  LocalChat,
  LocalNote,
  Post,
  PostComment,
  TelegramProfileConfig,
} from "@/shared/types";
import type { DomainDispatchAction } from "@/app/model/store/domain/actions";

export const domainActions = {
  updatePosts: (posts: Post[]): DomainDispatchAction => ({ type: "UPDATE_POSTS", posts }),

  updatePost: (postId: number, patch: Partial<Post>): DomainDispatchAction => ({
    type: "UPDATE_POST",
    postId,
    patch,
  }),

  reorderPosts: (posts: Post[]): DomainDispatchAction => ({ type: "REORDER_POSTS", posts }),

  deletePost: (postId: number): DomainDispatchAction => ({ type: "DELETE_POST", postId }),

  addLocalChat: (postId: number, chat: LocalChat): DomainDispatchAction => ({
    type: "ADD_LOCAL_CHAT",
    postId,
    chat,
  }),

  pushLocalChatMsg: (postId: number, chatId: number, message: ChatMessage): DomainDispatchAction => ({
    type: "PUSH_LOCAL_CHAT_MSG",
    postId,
    chatId,
    message,
  }),

  updateLocalChatMessage: (
    postId: number,
    chatId: number,
    path: number[],
    text: string,
  ): DomainDispatchAction => ({
    type: "UPDATE_LOCAL_CHAT_MESSAGE",
    postId,
    chatId,
    path,
    text,
  }),

  deleteLocalChatMessage: (postId: number, chatId: number, path: number[]): DomainDispatchAction => ({
    type: "DELETE_LOCAL_CHAT_MESSAGE",
    postId,
    chatId,
    path,
  }),

  deleteLocalChat: (postId: number, chatId: number): DomainDispatchAction => ({
    type: "DELETE_LOCAL_CHAT",
    postId,
    chatId,
  }),

  renameLocalChat: (postId: number, chatId: number, title: string): DomainDispatchAction => ({
    type: "RENAME_LOCAL_CHAT",
    postId,
    chatId,
    title,
  }),

  addPostNote: (postId: number, note: LocalNote): DomainDispatchAction => ({
    type: "ADD_POST_NOTE",
    postId,
    note,
  }),

  deletePostNote: (postId: number, noteId: number): DomainDispatchAction => ({
    type: "DELETE_POST_NOTE",
    postId,
    noteId,
  }),

  togglePostNoteAi: (postId: number, noteId: number): DomainDispatchAction => ({
    type: "TOGGLE_POST_NOTE_AI",
    postId,
    noteId,
  }),

  updatePostNote: (postId: number, noteId: number, patch: Partial<LocalNote>): DomainDispatchAction => ({
    type: "UPDATE_POST_NOTE",
    postId,
    noteId,
    patch,
  }),

  addPostComment: (postId: number, comment: PostComment): DomainDispatchAction => ({
    type: "ADD_POST_COMMENT",
    postId,
    comment,
  }),

  addGlobalChat: (chat: GlobalChat): DomainDispatchAction => ({ type: "ADD_GLOBAL_CHAT", chat }),

  pushGlobalChat: (chatId: string, message: ChatMessage): DomainDispatchAction => ({
    type: "PUSH_GLOBAL_CHAT",
    chatId,
    message,
  }),

  updateGlobalChatMessage: (chatId: string, path: number[], text: string): DomainDispatchAction => ({
    type: "UPDATE_GLOBAL_CHAT_MESSAGE",
    chatId,
    path,
    text,
  }),

  deleteGlobalChatMessage: (chatId: string, path: number[]): DomainDispatchAction => ({
    type: "DELETE_GLOBAL_CHAT_MESSAGE",
    chatId,
    path,
  }),

  deleteGlobalChat: (chatId: string): DomainDispatchAction => ({ type: "DELETE_GLOBAL_CHAT", chatId }),

  renameGlobalChat: (chatId: string, title: string): DomainDispatchAction => ({
    type: "RENAME_GLOBAL_CHAT",
    chatId,
    title,
  }),

  updateGlobalNotes: (notes: GlobalNote[]): DomainDispatchAction => ({ type: "UPDATE_GLOBAL_NOTES", notes }),

  upsertGlobalNote: (note: GlobalNote): DomainDispatchAction => ({ type: "UPSERT_GLOBAL_NOTE", note }),

  deleteGlobalNote: (noteId: string): DomainDispatchAction => ({ type: "DELETE_GLOBAL_NOTE", noteId }),

  setAiVariant: (
    scope: "gchat" | "post",
    entityId: string | number,
    path: number[],
    variantIdx: number,
  ): DomainDispatchAction => ({ type: "SET_AI_VARIANT", scope, entityId, path, variantIdx }),

  setUserBranch: (
    scope: "gchat" | "post",
    entityId: string | number,
    path: number[],
    branchIdx: number,
    postId?: number,
  ): DomainDispatchAction => ({ type: "SET_USER_BRANCH", scope, entityId, path, branchIdx, postId }),

  updateChannelProfile: (config: ChannelProfileConfig): DomainDispatchAction => ({
    type: "UPDATE_CHANNEL_PROFILE",
    config,
  }),

  updateAiConfig: (config: AiProfileConfig): DomainDispatchAction => ({
    type: "UPDATE_AI_CONFIG",
    config,
  }),

  updateTelegramConfig: (config: TelegramProfileConfig): DomainDispatchAction => ({
    type: "UPDATE_TELEGRAM_CONFIG",
    config,
  }),
} as const;
