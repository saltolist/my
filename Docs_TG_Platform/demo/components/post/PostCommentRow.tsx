"use client";

import { avatarHue, avatarInitials } from "@/lib/postComments";
import type { PostComment } from "@/lib/types";

type Props = {
  comment: PostComment;
  parent?: PostComment;
  onReply?: () => void;
};

export default function PostCommentRow({ comment, parent, onReply }: Props) {
  const hue = avatarHue(comment.author);
  return (
    <article className={`post-comment${parent ? " post-comment--reply" : ""}`}>
      <div
        className="post-comment-avatar"
        style={{ background: `hsl(${hue} 42% 38%)` }}
        aria-hidden
      >
        {avatarInitials(comment.author)}
      </div>
      <div className="post-comment-main">
        <div className="post-comment-head">
          <span className="post-comment-author">{comment.author}</span>
          <span className="post-comment-date">{comment.date}</span>
        </div>
        {parent ? (
          <div className="post-comment-quote">
            <span className="post-comment-quote-author">{parent.author}</span>
            <span className="post-comment-quote-text">{parent.text}</span>
          </div>
        ) : null}
        <p className="post-comment-text">{comment.text}</p>
        {onReply ? (
          <button className="post-comment-reply-btn" onClick={onReply} type="button">
            Ответить
          </button>
        ) : null}
      </div>
    </article>
  );
}
