"use client";

import { useEffect, useRef, useState } from "react";
import { autoResize } from "@/lib/helpers";
import type { PostComment } from "@/lib/types";

type Props = {
  replyTo: PostComment | null;
  onCancelReply: () => void;
  onSubmit: (text: string) => void;
};

export default function CommentComposer({ replyTo, onCancelReply, onSubmit }: Props) {
  const [draft, setDraft] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current, 16);
  }, [draft]);

  useEffect(() => {
    if (replyTo) taRef.current?.focus();
  }, [replyTo]);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSubmit(text);
    setDraft("");
  }

  return (
    <div className="input-wrap post-comments-input-wrap">
      {replyTo ? (
        <div className="comment-reply-banner">
          <span>
            Ответ для <strong>{replyTo.author}</strong>
          </span>
          <button
            className="comment-reply-cancel"
            onClick={onCancelReply}
            type="button"
            aria-label="Отменить ответ"
          >
            ✕
          </button>
        </div>
      ) : null}
      <div className="input-box">
        <textarea
          ref={taRef}
          placeholder="Написать комментарий..."
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === "Escape" && replyTo) {
              e.preventDefault();
              onCancelReply();
            }
          }}
        />
        <div className="input-bottom">
          <div className="input-tools" />
          <button className="send-btn" onClick={submit} type="button" aria-label="Отправить комментарий">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
