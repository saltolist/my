import type { RepositoryBundle } from "@/shared/api/repositories";
import { initialGlobalChats, initialGlobalNotes, initialPosts } from "@/shared/data/seed-data";
import type { GlobalChat, GlobalNote, Post } from "@/shared/types";

/** In-memory repository backed by seed data until real API is connected. */
export function createSeedRepositories(): RepositoryBundle {
  let posts = [...initialPosts];
  let globalChats = [...initialGlobalChats];
  let globalNotes = [...initialGlobalNotes];

  return {
    posts: {
      async list() {
        return posts;
      },
      async update(id, patch) {
        const idx = posts.findIndex((p) => p.id === id);
        if (idx < 0) throw new Error(`Post ${id} not found`);
        posts[idx] = { ...posts[idx], ...patch };
        return posts[idx];
      },
    },
    chats: {
      async listGlobal() {
        return globalChats;
      },
      async pushMessage(chatId, text) {
        const chat = globalChats.find((c) => c.id === chatId);
        if (!chat) throw new Error(`Chat ${chatId} not found`);
        const updated: GlobalChat = {
          ...chat,
          history: [...chat.history, { role: "user", text }],
          preview: text,
          date: "сейчас",
        };
        globalChats = globalChats.map((c) => (c.id === chatId ? updated : c));
        return updated;
      },
    },
    notes: {
      async listGlobal() {
        return globalNotes;
      },
      async upsert(note) {
        const exists = globalNotes.some((n) => n.id === note.id);
        globalNotes = exists
          ? globalNotes.map((n) => (n.id === note.id ? note : n))
          : [note, ...globalNotes];
        return note;
      },
      async remove(noteId) {
        globalNotes = globalNotes.filter((n) => n.id !== noteId);
      },
    },
  };
}
