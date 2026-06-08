"use client";

import { postTitle } from "@/shared/lib/postTitle";
import type { Post } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type TopPostsListProps = {
  posts: Post[];
  onPostClick?: (postId: number) => void;
};

export function TopPostsList({ posts, onPostClick }: TopPostsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ постов</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет опубликованных постов</p>
        ) : (
          posts.map((post, index) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onPostClick?.(post.id)}
              className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 text-left transition-colors hover:bg-muted/50"
            >
              <span className="w-5 shrink-0 text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{postTitle(post)}</span>
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {post.metrics?.views ?? "—"}
              </Badge>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
