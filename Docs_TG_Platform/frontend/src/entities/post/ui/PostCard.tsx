"use client";

import { PostStatusBadge } from "@/entities/post/ui/PostStatusBadge";
import { DraftDragHandle } from "@/entities/post/ui/draft-drag-handle";
import { PostMediaBlock } from "@/entities/post/ui/post-media-block";
import { PostMetricsRow } from "@/entities/post/ui/post-metrics-row";
import { ReactionPills } from "@/entities/post/ui/reaction-pills";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import type { FeedCardWidth } from "@/shared/types";
import type { Post } from "@/shared/types";

export type PostCardProps = {
  post: Post;
  width: FeedCardWidth;
  onClick?: () => void;
  onCommentsClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
};

export function PostCard({
  post,
  width,
  onClick,
  onCommentsClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: PostCardProps) {
  const media = post.media?.[0];
  const metrics = post.metrics;
  const commentsCount = post.comments?.length ?? 0;
  const isPublished = post.status === "published";

  return (
    <Card
      data-post-card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        isDragging && "opacity-40",
      )}
      style={{ width, maxWidth: "100%" }}
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-3 pt-4">
        {draggable ? (
          <DraftDragHandle onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ) : null}

        {media ? <PostMediaBlock media={media} /> : null}

        {post.rubric ? (
          <Badge variant="outline" className="w-fit">
            {post.rubric}
          </Badge>
        ) : null}

        {post.text ? (
          <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Пост пустой — нажми чтобы начать писать
          </p>
        )}

        {isPublished && metrics ? <ReactionPills reactions={metrics.reactions} /> : null}
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 border-t bg-muted/30">
        <PostStatusBadge post={post} />

        {isPublished && metrics ? (
          <PostMetricsRow
            metrics={metrics}
            commentsCount={commentsCount}
            onCommentsClick={onCommentsClick}
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}
