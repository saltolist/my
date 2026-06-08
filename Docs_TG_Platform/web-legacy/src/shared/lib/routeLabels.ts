import { postTitle, truncate } from "@/shared/lib/helpers";
import type { Post, PostMode, ScreenId } from "@/shared/types";

export type RouteSnapshotLike = {
  screen: ScreenId;
  currentPostId: number | null;
  postMode: PostMode;
  currentGChatId: string | null;
};

const SCREEN_LABELS: Record<ScreenId, string> = {
  home: "Главная",
  feed: "Лента",
  chats: "Чаты",
  notes: "Заметки",
  analytics: "Аналитика",
  profile: "Профиль",
  gchat: "Чат",
  post: "Пост",
  note: "Заметка",
};

const POST_MODE_LABELS: Record<PostMode, string> = {
  chat: "Пост",
  comments: "Комментарии",
  notes: "Заметки",
  chats: "Чаты",
};

export function routeSnapshotTitle(
  snap: RouteSnapshotLike,
  posts: Post[],
): string {
  if (snap.screen === "post") {
    const post = posts.find((p) => p.id === snap.currentPostId);
    if (post) return truncate(postTitle(post), 28);
    return POST_MODE_LABELS[snap.postMode] ?? "Пост";
  }
  if (snap.screen === "gchat") return "Чат";
  if (snap.screen === "note") return "Заметка";
  return SCREEN_LABELS[snap.screen] ?? "Назад";
}

export function postViewBackTitle(mode: PostMode): string {
  return POST_MODE_LABELS[mode] ?? "Пост";
}
