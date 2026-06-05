"use client";

import { useEffect, useRef, useState } from "react";
import AttachMenu from "@/widgets/composer/ui/AttachMenu";
import { autoResize, readFileAsMedia } from "@/shared/lib/helpers";
import { onComposerShellMouseDown } from "@/shared/lib/composerPointerDown";
import type { PostComment, PostMedia } from "@/shared/types";
import PostMediaBlock from "@/entities/post/ui/PostMediaBlock";

type Props = {
  replyTo: PostComment | null;
  onCancelReply: () => void;
  onSubmit: (text: string, media: PostMedia[]) => void;
};

export default function CommentComposer({ replyTo, onCancelReply, onSubmit }: Props) {
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PostMedia[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current, 16);
  }, [draft]);

  useEffect(() => {
    if (replyTo) taRef.current?.focus();
  }, [replyTo]);

  function removePendingMedia(index: number) {
    setPendingMedia((arr) => arr.filter((_, i) => i !== index));
  }

  function submit() {
    const text = draft.trim();
    if (!text && pendingMedia.length === 0) return;
    onSubmit(text, pendingMedia);
    setDraft("");
    setPendingMedia([]);
  }

  return (
    <div className="input-wrap post-comments-input-wrap" onMouseDown={onComposerShellMouseDown}>
      <div className="composer-backdrop" aria-hidden="true" />
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
        {pendingMedia.length > 0 ? (
          <PostMediaBlock media={pendingMedia} onRemove={removePendingMedia} />
        ) : null}
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
            if (e.key === "Backspace" && draft === "" && pendingMedia.length > 0) {
              e.preventDefault();
              setPendingMedia((arr) => arr.slice(0, -1));
            }
          }}
        />
        <div className="input-bottom">
          <div className="input-tools">
            <AttachMenu
              scope="feed"
              onAttach={async (att) => {
                if (att.kind === "file" && att.file) {
                  try {
                    const media = await readFileAsMedia(att.file);
                    setPendingMedia((arr) => [...arr, media]);
                  } catch {
                    /* ignore read errors in demo */
                  }
                }
              }}
            />
          </div>
          <button className="send-btn" onClick={submit} type="button" aria-label="Отправить комментарий">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
