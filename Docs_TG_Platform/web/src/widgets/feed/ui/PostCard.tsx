"use client";

import { getPostMediaItems } from "@/shared/lib/helpers";
import type { Post } from "@/shared/types";
import { PostMediaBlock, PostStatus } from "@/entities/post";
import PostCommentsRow from "./PostCommentsRow";
import { PostReactionPills, PostViewsReposts } from "./PostEngagement";

export default function PostCard({
  post,
  onOpen,
  onOpenComments,
}: {
  post: Post;
  onOpen: () => void;
  onOpenComments?: () => void;
}) {
  const mediaItems = getPostMediaItems(post);
  const isTextOnlyPub =
    mediaItems.length === 0 && (post.status === "published" || post.status === "scheduled");

  return (
    <div
      className={["post-card", isTextOnlyPub ? "post-card--no-media" : ""].filter(Boolean).join(" ")}
      onClick={onOpen}
    >
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
          <div className="post-meta">
            <PostStatus post={post} />
          </div>
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
