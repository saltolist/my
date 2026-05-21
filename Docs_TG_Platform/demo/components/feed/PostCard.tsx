"use client";

import { getPostMediaItems } from "@/lib/helpers";
import type { Post } from "@/lib/types";
import PostMediaBlock from "../post/PostMediaBlock";
import PostStatus from "./PostStatus";
import PostCommentsRow from "../post/PostCommentsRow";
import { PostReactionPills, PostViewsReposts } from "./PostEngagement";

export default function PostCard({
  post,
  onOpen,
  onOpenComments,
  draftHandleProps,
}: {
  post: Post;
  onOpen: () => void;
  onOpenComments?: () => void;
  draftHandleProps?: {
    onMouseDown?: () => void;
    onClickStop: (e: React.MouseEvent) => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
  };
}) {
  const statusEl = <PostStatus post={post} />;

  const mediaItems = getPostMediaItems(post);
  const isDraftDnD = post.status === "draft" && !!draftHandleProps;
  const isTextOnlyPub =
    mediaItems.length === 0 && (post.status === "published" || post.status === "scheduled");

  const draftDragHandle = isDraftDnD && draftHandleProps && (
    <div
      className="drag-handle"
      title="Перетащить"
      draggable
      onClick={draftHandleProps.onClickStop}
      onMouseDown={draftHandleProps.onMouseDown}
      onDragStart={draftHandleProps.onDragStart}
      onDragEnd={draftHandleProps.onDragEnd}
    >
      <span className="drag-handle-dots" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="drag-handle-dot" />
        ))}
      </span>
    </div>
  );

  return (
    <div
      className={[
        "post-card",
        isDraftDnD ? "post-card--draft-dnd" : "",
        isTextOnlyPub ? "post-card--no-media" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onOpen}
    >
      {isDraftDnD ? (
        <div className="draft-drag-handle-rail">{draftDragHandle}</div>
      ) : null}
      <div className="post-card-body">
        {mediaItems.length > 0 ? (
          <div className="post-card-media">
            <PostMediaBlock media={mediaItems} />
          </div>
        ) : null}
        {post.text ? (
          <div className="post-card-text">{post.text}</div>
        ) : (
          <div className="post-card-text empty">Пост пустой — нажми чтобы начать писать</div>
        )}
        {post.status === "published" && post.metrics ? (
          <PostReactionPills reactions={post.metrics.reactions} />
        ) : null}
        <div className="post-card-footer">
          <div className="post-meta">{statusEl}</div>
          {post.status === "published" && post.metrics ? (
            <PostViewsReposts views={post.metrics.views} reposts={post.metrics.reposts} />
          ) : null}
        </div>
        {post.status === "published" && post.metrics ? (
          <PostCommentsRow
            count={post.comments?.length ?? 0}
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments?.();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
