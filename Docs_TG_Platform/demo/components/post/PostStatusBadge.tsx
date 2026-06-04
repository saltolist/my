"use client";

import PostStatus from "@/components/feed/PostStatus";
import type { Post } from "@/lib/types";

export function PostStatusBadge({ post }: { post: Post }) {
  return <PostStatus post={post} />;
}
