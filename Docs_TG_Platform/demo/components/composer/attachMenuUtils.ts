import { postTitle } from "@/lib/helpers";
import type { Post, PostMedia } from "@/lib/types";

export type AttachedMediaItem = { postId: number; media: PostMedia; postTitle: string };

let attachIdCounter = 0;

export function nextAttachMenuId(): string {
  attachIdCounter += 1;
  return `att-${Date.now()}-${attachIdCounter}`;
}

export function collectAttachedMedia(posts: Post[], attachedIds: number[]): AttachedMediaItem[] {
  return posts
    .filter((p) => attachedIds.includes(p.id))
    .flatMap((p) =>
      (p.media ?? []).map((m) => ({ postId: p.id, media: m, postTitle: postTitle(p) })),
    );
}
