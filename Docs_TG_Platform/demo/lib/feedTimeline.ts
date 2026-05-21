import { formatFeedDayLabel, postDayStart, postFreshness } from "@/lib/helpers";
import type { Post } from "@/lib/types";

export type FeedDayGroup = {
  key: string;
  label: string;
  posts: Post[];
};

/** Опубликованные по дням: старые сверху, новые внизу; метка — статичный разделитель. */
export function buildPublishedFeedDayGroups(posts: Post[]): FeedDayGroup[] {
  const sorted = [...posts].sort((a, b) => postFreshness(a) - postFreshness(b));
  const groups: FeedDayGroup[] = [];
  let lastDayKey = "";

  for (const post of sorted) {
    const dayStart = postDayStart(post);
    const dayKey = dayStart ? String(dayStart) : `unknown-${post.id}`;
    if (dayKey !== lastDayKey) {
      groups.push({
        key: dayKey,
        label: dayStart ? formatFeedDayLabel(dayStart) : "Без даты",
        posts: [],
      });
      lastDayKey = dayKey;
    }
    groups[groups.length - 1].posts.push(post);
  }

  return groups;
}

/** Отложенные: ближайшая публикация сверху. */
export function sortPostsByPublicationTime(posts: Post[], direction: "desc" | "asc" = "desc"): Post[] {
  return [...posts].sort((a, b) => {
    const diff = postFreshness(b) - postFreshness(a);
    return direction === "desc" ? diff : -diff;
  });
}
