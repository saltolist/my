import { apiRequest } from "@/shared/api/httpClient";
import type { RepositoryBundle } from "@/shared/api/repositories";
import type {
  AiProfileConfig,
  ChannelProfileConfig,
  GlobalChat,
  GlobalNote,
  Post,
  TelegramProfileConfig,
} from "@/shared/types";

const v1 = "/api/v1";

/** REST repository implementations — contract for the backend service. */
export function createHttpRepositories(): RepositoryBundle {
  return {
    posts: {
      list: () => apiRequest<Post[]>(`${v1}/posts`),
      create: (post) => apiRequest<Post>(`${v1}/posts`, { method: "POST", body: post }),
      update: (id, patch) =>
        apiRequest<Post>(`${v1}/posts/${id}`, { method: "PATCH", body: patch }),
      reorder: (posts) =>
        apiRequest<Post[]>(`${v1}/posts/reorder`, {
          method: "PUT",
          body: { posts },
        }),
      remove: (id) => apiRequest<void>(`${v1}/posts/${id}`, { method: "DELETE" }),
    },
    chats: {
      listGlobal: () => apiRequest<GlobalChat[]>(`${v1}/global-chats`),
      create: (chat) =>
        apiRequest<GlobalChat>(`${v1}/global-chats`, { method: "POST", body: chat }),
      pushMessage: (chatId, text) =>
        apiRequest<GlobalChat>(`${v1}/global-chats/${chatId}/messages`, {
          method: "POST",
          body: { text },
        }),
      update: (chatId, patch) =>
        apiRequest<GlobalChat>(`${v1}/global-chats/${chatId}`, {
          method: "PATCH",
          body: patch,
        }),
      rename: (chatId, title) =>
        apiRequest<GlobalChat>(`${v1}/global-chats/${chatId}`, {
          method: "PATCH",
          body: { title },
        }),
      remove: (chatId) =>
        apiRequest<void>(`${v1}/global-chats/${chatId}`, { method: "DELETE" }),
    },
    notes: {
      listGlobal: () => apiRequest<GlobalNote[]>(`${v1}/global-notes`),
      upsert: (note) =>
        apiRequest<GlobalNote>(`${v1}/global-notes/${note.id}`, {
          method: "PUT",
          body: note,
        }),
      remove: (noteId) =>
        apiRequest<void>(`${v1}/global-notes/${noteId}`, { method: "DELETE" }),
    },
    profile: {
      getChannel: () => apiRequest<ChannelProfileConfig>(`${v1}/profile/channel`),
      updateChannel: (config) =>
        apiRequest<ChannelProfileConfig>(`${v1}/profile/channel`, {
          method: "PUT",
          body: config,
        }),
      getAi: () => apiRequest<AiProfileConfig>(`${v1}/profile/ai`),
      updateAi: (config) =>
        apiRequest<AiProfileConfig>(`${v1}/profile/ai`, {
          method: "PUT",
          body: config,
        }),
      getTelegram: () => apiRequest<TelegramProfileConfig>(`${v1}/profile/telegram`),
      updateTelegram: (config) =>
        apiRequest<TelegramProfileConfig>(`${v1}/profile/telegram`, {
          method: "PUT",
          body: config,
        }),
    },
  };
}

/** Same HTTP paths as real API; MSW intercepts fetch in development. */
export function createMswRepositories(): RepositoryBundle {
  return createHttpRepositories();
}
