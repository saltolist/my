"use client";

import { useRef, useState } from "react";
import { useDomain } from "@/state/domain-store";
import type { Post, PostComment, PostMedia, PostMetrics } from "@/lib/types";
import PostMediaBlock from "./PostMediaBlock";
import { PostReactionPills, PostViewsReposts } from "../feed/PostEngagement";
import CommentComposer from "./CommentComposer";
import PostCardCommentsSection from "./PostCardCommentsSection";

type Props = {
  post: Post;
  search: string;
  postCardRef: React.RefObject<HTMLDivElement | null>;
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
  const { dispatch } = useDomain();
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const comments = post.comments ?? [];

  function addComment(text: string, media: PostMedia[]) {
    const comment: PostComment = {
      id: Date.now(),
      author: "Вы",
      date: "сейчас",
      text,
      ...(media.length > 0 ? { media: [...media] } : {}),
      ...(replyTo ? { replyToId: replyTo.id } : {}),
    };
    dispatch({ type: "ADD_POST_COMMENT", postId: post.id, comment });
    setReplyTo(null);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }

  return (
    <>
      <div className="composer-scroll-wrap">
        <div className="post-body post-comments-body" ref={scrollRef}>
          <div className="composer-scroll-body">
            <div className="post-body-inner">
              <div
                className={[
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
                    <div className="post-card-text empty">Пост пустой</div>
                  )}
                  {metrics ? <PostReactionPills reactions={metrics.reactions} /> : null}
                  <div className="post-card-footer">
                    <div className="post-meta">{badge}</div>
                    {metrics ? (
                      <PostViewsReposts views={metrics.views} reposts={metrics.reposts} />
                    ) : null}
                  </div>
                  <PostCardCommentsSection
                    comments={comments}
                    search={search}
                    onReply={(c) => setReplyTo(c)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommentComposer replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSubmit={addComment} />
    </>
  );
}
