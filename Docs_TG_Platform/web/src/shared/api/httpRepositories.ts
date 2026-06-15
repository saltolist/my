import { apiV1Path } from "@/shared/config/basePath";
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

export function createHttpRepositories(): RepositoryBundle {
  return {
    posts: {
      list: () => apiRequest<Post[]>(apiV1Path("posts")),
      create: (post) => apiRequest<Post>(apiV1Path("posts"), { method: "POST", body: post }),
      update: (id, patch) =>
        apiRequest<Post>(apiV1Path(`posts/${id}`), { method: "PATCH", body: patch }),
      reorder: (posts) =>
        apiRequest<Post[]>(apiV1Path("posts/reorder"), {
          method: "PUT",
          body: { posts },
        }),
      remove: (id) => apiRequest<void>(apiV1Path(`posts/${id}`), { method: "DELETE" }),
    },
    chats: {
      listGlobal: () => apiRequest<GlobalChat[]>(apiV1Path("global-chats")),
      create: (chat) =>
        apiRequest<GlobalChat>(apiV1Path("global-chats"), { method: "POST", body: chat }),
      pushMessage: (chatId, text) =>
        apiRequest<GlobalChat>(apiV1Path(`global-chats/${chatId}/messages`), {
          method: "POST",
          body: { text },
        }),
      update: (chatId, patch) =>
        apiRequest<GlobalChat>(apiV1Path(`global-chats/${chatId}`), {
          method: "PATCH",
          body: patch,
        }),
      rename: (chatId, title) =>
        apiRequest<GlobalChat>(apiV1Path(`global-chats/${chatId}`), {
          method: "PATCH",
          body: { title },
        }),
      remove: (chatId) =>
        apiRequest<void>(apiV1Path(`global-chats/${chatId}`), { method: "DELETE" }),
    },
    notes: {
      listGlobal: () => apiRequest<GlobalNote[]>(apiV1Path("global-notes")),
      upsert: (note) =>
        apiRequest<GlobalNote>(apiV1Path(`global-notes/${note.id}`), {
          method: "PUT",
          body: note,
        }),
      remove: (noteId) =>
        apiRequest<void>(apiV1Path(`global-notes/${noteId}`), { method: "DELETE" }),
    },
    profile: {
      getChannel: () => apiRequest<ChannelProfileConfig>(apiV1Path("profile/channel")),
      updateChannel: (config) =>
        apiRequest<ChannelProfileConfig>(apiV1Path("profile/channel"), {
          method: "PUT",
          body: config,
        }),
      getAi: () => apiRequest<AiProfileConfig>(apiV1Path("profile/ai")),
      updateAi: (config) =>
        apiRequest<AiProfileConfig>(apiV1Path("profile/ai"), {
          method: "PUT",
          body: config,
        }),
      getTelegram: () => apiRequest<TelegramProfileConfig>(apiV1Path("profile/telegram")),
      updateTelegram: (config) =>
        apiRequest<TelegramProfileConfig>(apiV1Path("profile/telegram"), {
          method: "PUT",
          body: config,
        }),
    },
  };
}

export function createMswRepositories(): RepositoryBundle {
  return createHttpRepositories();
}
