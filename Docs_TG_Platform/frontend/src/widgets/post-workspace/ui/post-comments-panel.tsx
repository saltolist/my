"use client";

import { PostCard, PostCommentRow } from "@/entities/post";
import type { Post, PostComment } from "@/shared/types";

export type PostCommentsPanelProps = {
  post: Post;
  comments: PostComment[];
  onCommentsClick?: () => void;
  className?: string;
};

export function PostCommentsPanel({
  post,
  comments,
  onCommentsClick,
  className,
}: PostCommentsPanelProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <PostCard
          post={post}
          width={500}
          onCommentsClick={onCommentsClick}
        />
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет комментариев</p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <PostCommentRow key={c.id} comment={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
