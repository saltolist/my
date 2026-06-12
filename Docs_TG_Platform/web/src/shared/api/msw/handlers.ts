import { http, HttpResponse } from "msw";
import { appendToActiveHistory } from "@/shared/lib/chatPaths";
import { getGlobalReply } from "@/shared/lib/replies";
import type { GlobalChat, GlobalNote, Post } from "@/shared/types";
import { mswStore } from "./store";

const v1 = "/api/v1";

function notFound(message: string) {
  return HttpResponse.json({ error: message }, { status: 404 });
}

export const handlers = [
  http.get(`${v1}/posts`, () => HttpResponse.json(mswStore.posts)),

  http.post(`${v1}/posts`, async ({ request }) => {
    const post = (await request.json()) as Post;
    mswStore.posts = [post, ...mswStore.posts.filter((p) => p.id !== post.id)];
    return HttpResponse.json(post, { status: 201 });
  }),

  http.patch(`${v1}/posts/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const patch = (await request.json()) as Partial<Post>;
    const idx = mswStore.posts.findIndex((p) => p.id === id);
    if (idx < 0) return notFound(`Post ${id} not found`);
    mswStore.posts[idx] = { ...mswStore.posts[idx], ...patch };
    return HttpResponse.json(mswStore.posts[idx]);
  }),

  http.put(`${v1}/posts/reorder`, async ({ request }) => {
    const body = (await request.json()) as { posts: Post[] };
    mswStore.posts = [...body.posts];
    return HttpResponse.json(mswStore.posts);
  }),

  http.delete(`${v1}/posts/:id`, ({ params }) => {
    const id = Number(params.id);
    const before = mswStore.posts.length;
    mswStore.posts = mswStore.posts.filter((p) => p.id !== id);
    if (mswStore.posts.length === before) return notFound(`Post ${id} not found`);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${v1}/global-chats`, () => HttpResponse.json(mswStore.globalChats)),

  http.post(`${v1}/global-chats`, async ({ request }) => {
    const chat = (await request.json()) as GlobalChat;
    mswStore.globalChats = [chat, ...mswStore.globalChats.filter((c) => c.id !== chat.id)];
    return HttpResponse.json(chat, { status: 201 });
  }),

  http.post(`${v1}/global-chats/:chatId/messages`, async ({ params, request }) => {
    const chatId = String(params.chatId);
    const { text } = (await request.json()) as { text: string };
    const chat = mswStore.globalChats.find((c) => c.id === chatId);
    if (!chat) return notFound(`Chat ${chatId} not found`);

    const aiText = getGlobalReply(text);
    let history = appendToActiveHistory(chat.history, { role: "user", text });
    history = appendToActiveHistory(history, {
      role: "ai",
      text: aiText,
      llmLabel: "OpenAI / gpt-4o",
      webLabel: "Perplexity / search-api",
    });
    const updated: GlobalChat = {
      ...chat,
      history,
      preview: aiText.slice(0, 80),
      date: "сейчас",
    };
    mswStore.globalChats = mswStore.globalChats.map((c) => (c.id === chatId ? updated : c));
    return HttpResponse.json(updated);
  }),

  http.patch(`${v1}/global-chats/:chatId`, async ({ params, request }) => {
    const chatId = String(params.chatId);
    const patch = (await request.json()) as Partial<GlobalChat>;
    const chat = mswStore.globalChats.find((c) => c.id === chatId);
    if (!chat) return notFound(`Chat ${chatId} not found`);
    const updated = { ...chat, ...patch };
    mswStore.globalChats = mswStore.globalChats.map((c) => (c.id === chatId ? updated : c));
    return HttpResponse.json(updated);
  }),

  http.delete(`${v1}/global-chats/:chatId`, ({ params }) => {
    const chatId = String(params.chatId);
    const before = mswStore.globalChats.length;
    mswStore.globalChats = mswStore.globalChats.filter((c) => c.id !== chatId);
    if (mswStore.globalChats.length === before) return notFound(`Chat ${chatId} not found`);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${v1}/global-notes`, () => HttpResponse.json(mswStore.globalNotes)),

  http.put(`${v1}/global-notes/:noteId`, async ({ params, request }) => {
    const noteId = String(params.noteId);
    const note = (await request.json()) as GlobalNote;
    if (note.id !== noteId) {
      return HttpResponse.json({ error: "Note id mismatch" }, { status: 400 });
    }
    const exists = mswStore.globalNotes.some((n) => n.id === noteId);
    mswStore.globalNotes = exists
      ? mswStore.globalNotes.map((n) => (n.id === noteId ? note : n))
      : [note, ...mswStore.globalNotes];
    return HttpResponse.json(note);
  }),

  http.delete(`${v1}/global-notes/:noteId`, ({ params }) => {
    const noteId = String(params.noteId);
    const before = mswStore.globalNotes.length;
    mswStore.globalNotes = mswStore.globalNotes.filter((n) => n.id !== noteId);
    if (mswStore.globalNotes.length === before) return notFound(`Note ${noteId} not found`);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${v1}/profile/channel`, () => HttpResponse.json(mswStore.channelProfile)),

  http.put(`${v1}/profile/channel`, async ({ request }) => {
    mswStore.channelProfile = (await request.json()) as typeof mswStore.channelProfile;
    return HttpResponse.json(mswStore.channelProfile);
  }),

  http.get(`${v1}/profile/ai`, () => HttpResponse.json(mswStore.aiProfile)),

  http.put(`${v1}/profile/ai`, async ({ request }) => {
    mswStore.aiProfile = (await request.json()) as typeof mswStore.aiProfile;
    return HttpResponse.json(mswStore.aiProfile);
  }),

  http.get(`${v1}/profile/telegram`, () => HttpResponse.json(mswStore.telegramProfile)),

  http.put(`${v1}/profile/telegram`, async ({ request }) => {
    mswStore.telegramProfile = (await request.json()) as typeof mswStore.telegramProfile;
    return HttpResponse.json(mswStore.telegramProfile);
  }),
];
