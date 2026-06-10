"use client";

import { useMemo, type RefObject } from "react";

import { PostMediaBlock } from "@/entities/post";
import { filterPostComments, findPostComment } from "@/shared/lib/postComments";
import { PostReactionPills, PostViewsReposts } from "@/widgets/feed";
import type { Post, PostMedia, PostMetrics } from "@/shared/types";

import PostCommentRow from "./PostCommentRow";
import PostCommentsRow from "./PostCommentsRow";

type Props = {
  post: Post;
  search: string;
  postCardRef: RefObject<HTMLDivElement | null>;
  badge: React.ReactNode;
  metrics: PostMetrics | null;
  media: PostMedia[];
  phoneFormat?: boolean;
};

export default function PostCommentsPanel({
  post,
  search,
  postCardRef,
  badge,
  metrics,
  media,
  phoneFormat = false,
}: Props) {
  const comments = post.comments ?? [];
  const filtered = useMemo(
    () => filterPostComments(comments, search),
    [comments, search],
  );

  return (
    <div className="composer-scroll-wrap">
      <div className="post-body post-comments-body">
        <div className="composer-scroll-body">
          <div className="post-body-inner">
            <div
              className={[
                "post-card",
                "post-msg-card",
                phoneFormat ? "post-format-phone" : "",
                "post-msg-card--readonly",
                "post-msg-card--with-comments",
                media.length === 0 &&
                (post.status === "published" || post.status === "scheduled")
                  ? "post-card--no-media"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              ref={postCardRef}
            >
              <div className="post-card-body">
                {media.length > 0 ? (
                  <div className="post-card-media">
                    <PostMediaBlock media={media} />
                  </div>
                ) : null}
                {post.text ? (
                  <div className="post-card-text">{post.text}</div>
                ) : (
                  <div className="post-card-text empty">Пост пустой — начни писать...</div>
                )}
                {metrics ? <PostReactionPills reactions={metrics.reactions} /> : null}
                <div className="post-card-footer">
                  <div className="post-meta">{badge}</div>
                  {metrics ? (
                    <PostViewsReposts views={metrics.views} reposts={metrics.reposts} />
                  ) : null}
                </div>
                <PostCommentsRow count={comments.length} />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="post-comments-empty">
                {search.trim() ? "Ничего не найдено" : "Пока нет комментариев"}
              </div>
            ) : (
              <div className="post-comments-list">
                {filtered.map((c) => (
                  <PostCommentRow
                    key={c.id}
                    comment={c}
                    parent={c.replyToId ? findPostComment(comments, c.replyToId) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
