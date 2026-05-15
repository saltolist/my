"use client";

import { useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
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
};

export default function PostCommentsPanel({
  post,
  search,
  postCardRef,
  badge,
  metrics,
  media,
}: Props) {
  const { dispatch } = useApp();
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const comments = post.comments ?? [];

  function addComment(text: string) {
    const comment: PostComment = {
      id: Date.now(),
      author: "Вы",
      date: "сейчас",
      text,
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
      <div className="post-body post-comments-body" ref={scrollRef}>
        <div className="post-body-inner">
          <div className="post-msg-card post-msg-card--readonly post-msg-card--with-comments" ref={postCardRef}>
            {media.length > 0 ? (
              <div className="post-msg-media">
                <PostMediaBlock media={media} />
              </div>
            ) : null}
            <div className="post-msg-text">{post.text || "Пост пустой"}</div>
            {metrics ? <PostReactionPills reactions={metrics.reactions} /> : null}
            <div className="post-msg-card-tail">
              <div className="post-status-row">
                {badge}
                <div className="post-status-row-right">
                  {metrics ? <PostViewsReposts views={metrics.views} reposts={metrics.reposts} /> : null}
                </div>
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
      <CommentComposer replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSubmit={addComment} />
    </>
  );
}
