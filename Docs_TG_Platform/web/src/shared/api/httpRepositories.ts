import { apiRequest } from "@/shared/api/httpClient";
import type { RepositoryBundle } from "@/shared/api/repositories";
import type { GlobalChat, GlobalNote, Post } from "@/shared/types";

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
      pushMessage: (chatId, text) =>
        apiRequest<GlobalChat>(`${v1}/global-chats/${chatId}/messages`, {
          method: "POST",
          body: { text },
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
  };
}
