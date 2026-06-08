import { postTitle } from "@/shared/lib/postTitle";
import type { Post, PostStatus } from "@/shared/types";

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function postMatchesSearch(post: Post, query: string): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  return (
    postTitle(post).toLowerCase().includes(q) ||
    (post.text || "").toLowerCase().includes(q) ||
    (post.rubric ?? "").toLowerCase().includes(q)
  );
}

export function filterPostsByStatus(
  posts: Post[],
  status: PostStatus,
  query = "",
): Post[] {
  return posts.filter((p) => p.status === status && postMatchesSearch(p, query));
}

export type FeedPostSections = {
  published: Post[];
  scheduled: Post[];
  drafts: Post[];
};

export function buildFeedPostSections(posts: Post[], query = ""): FeedPostSections {
  return {
    published: filterPostsByStatus(posts, "published", query),
    scheduled: filterPostsByStatus(posts, "scheduled", query),
    drafts: filterPostsByStatus(posts, "draft", query),
  };
}

export type CreateDraftPostInput = {
  text: string;
  id?: number;
  created?: string;
};

export function createDraftPost({
  text,
  id,
  created = "только что",
}: CreateDraftPostInput): Post {
  const draftId = id ?? Math.floor(Math.random() * 1_000_000);
  const trimmed = text.trim();
  return {
    id: draftId,
    status: "draft",
    created,
    rubric: null,
    text: trimmed,
    notes: [],
    chats: [],
  };
}

export function canSubmitFeedDraft(text: string): boolean {
  return text.trim().length > 0;
}
