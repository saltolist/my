"use client";

import { useMemo } from "react";
import { PostCard } from "@/entities/post";
import { usePosts } from "@/entities/post/model/usePosts";
import { useReorderDrafts } from "@/features/manage-drafts";
import { useUiStore } from "@/app/model/store/ui-store";
import { buildFeedPostSections } from "@/shared/lib/feed/filterPosts";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { FeedSection } from "./ui/feed-section";

type FeedWidgetProps = {
  searchQuery?: string;
  onPostClick?: (postId: number) => void;
  onCommentsClick?: (postId: number) => void;
  className?: string;
};

export function FeedWidget({
  searchQuery = "",
  onPostClick,
  onCommentsClick,
  className,
}: FeedWidgetProps) {
  const { data: posts = [], isLoading } = usePosts();
  const feedCardWidth = useUiStore((s) => s.feedCardWidth);

  const { published, scheduled, drafts } = useMemo(
    () => buildFeedPostSections(posts, searchQuery),
    [posts, searchQuery],
  );

  const {
    draggingId,
    displayDrafts,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
  } = useReorderDrafts(drafts);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка ленты…</p>;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ScrollArea className="max-h-[calc(100vh-12rem)]">
        <div className="flex flex-col gap-8 pr-4">
          <FeedSection
            title="Опубликованные"
            count={published.length}
            emptyText="Нет опубликованных постов"
          >
            <div className="flex flex-col gap-4">
              {published.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  width={feedCardWidth}
                  onClick={() => onPostClick?.(post.id)}
                  onCommentsClick={() => onCommentsClick?.(post.id)}
                />
              ))}
            </div>
          </FeedSection>

          <FeedSection
            title="Отложенные"
            count={scheduled.length}
            emptyText="Нет отложенных постов"
          >
            <div className="flex flex-col gap-4">
              {scheduled.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  width={feedCardWidth}
                  onClick={() => onPostClick?.(post.id)}
                />
              ))}
            </div>
          </FeedSection>

          <FeedSection title="Черновики" count={drafts.length} emptyText="Нет черновиков">
            <div
              className="flex flex-col gap-4"
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {displayDrafts.map((post) => (
                <div key={post.id} data-draft-id={post.id}>
                  <PostCard
                    post={post}
                    width={feedCardWidth}
                    draggable
                    isDragging={draggingId === post.id}
                    onDragStart={onDragStart(post.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => onPostClick?.(post.id)}
                  />
                </div>
              ))}
            </div>
          </FeedSection>
        </div>
      </ScrollArea>
    </div>
  );
}
