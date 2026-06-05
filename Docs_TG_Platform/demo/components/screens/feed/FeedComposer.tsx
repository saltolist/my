"use client";

import AttachMenu from "@/components/composer/AttachMenu";
import PostMediaBlock from "@/components/post/PostMediaBlock";
import { onComposerShellMouseDown } from "@/lib/composerPointerDown";
import type { FeedScreenState } from "@/lib/hooks/useFeedScreen";

type Props = Pick<
  FeedScreenState,
  | "composerReady"
  | "taRef"
  | "draft"
  | "setDraft"
  | "pendingMedia"
  | "submitDraft"
  | "removePendingMedia"
  | "handleDraftKeyDown"
  | "handleAttach"
>;

export default function FeedComposer({
  composerReady,
  taRef,
  draft,
  setDraft,
  pendingMedia,
  submitDraft,
  removePendingMedia,
  handleDraftKeyDown,
  handleAttach,
}: Props) {
  return (
    <div
      className={`input-wrap${composerReady ? " is-composer-ready" : ""}`}
      onMouseDown={onComposerShellMouseDown}
    >
      <div className="composer-backdrop" aria-hidden="true" />
      <div className="input-box">
        {pendingMedia.length > 0 ? (
          <PostMediaBlock media={pendingMedia} onRemove={removePendingMedia} />
        ) : null}
        <textarea
          ref={taRef}
          id="feed-input"
          placeholder="Написать пост..."
          rows={1}
          autoComplete="off"
          suppressHydrationWarning
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleDraftKeyDown}
        />
        <div className="input-bottom">
          <div className="input-tools">
            <AttachMenu scope="feed" onAttach={handleAttach} />
          </div>
          <button className="send-btn" onClick={submitDraft} type="button">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
