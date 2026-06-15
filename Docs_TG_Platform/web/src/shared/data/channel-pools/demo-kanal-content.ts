import { initialPosts } from "@/shared/data/seed-data";
import type { MswStore } from "@/shared/api/msw/store";
import type { Post } from "@/shared/types";

function cloneSeed<T>(value: T): T {
  return structuredClone(value);
}

function channelPostsWithoutNotes(posts: Post[]): Post[] {
  return posts.map((post) => ({ ...post, notes: [] }));
}

/** Channel feed posts for @demochannel connect. Notes belong to the account, not the channel. */
export function importDemoKanalContent(target: MswStore): number {
  target.posts = channelPostsWithoutNotes(cloneSeed(initialPosts));
  return target.posts.length;
}
