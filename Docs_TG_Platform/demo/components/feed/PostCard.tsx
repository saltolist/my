"use client";

import { getPostMediaItems } from "@/lib/helpers";
import type { Post } from "@/lib/types";
import PostMediaBlock from "../post/PostMediaBlock";

export default function PostCard({
  post,
  onOpen,
  draftHandleProps,
}: {
  post: Post;
  onOpen: () => void;
  draftHandleProps?: {
    onMouseDown?: () => void;
    onClickStop: (e: React.MouseEvent) => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
  };
}) {
  let statusEl: React.ReactNode;
  if (post.status === "published") {
    statusEl = (
      <span className="post-status">
        <span className="dot-g">●</span> Опубликован
      </span>
    );
  } else if (post.status === "scheduled") {
    statusEl = (
      <span className="post-status">
        <span className="dot-o">◷</span> Отложено · {post.date}
      </span>
    );
  } else {
    statusEl = (
      <span className="post-status">
        <span className="dot-gr">✏</span> Черновик · создан {post.created}
      </span>
    );
  }

  const metrics =
    post.status === "published" && post.metrics ? (
      <div className="post-metrics">
        <span>👁 {post.metrics.views}</span>
        <span>❤ {post.metrics.reactions}</span>
        <span>↗ {post.metrics.reposts}</span>
      </div>
    ) : null;

  const mediaItems = getPostMediaItems(post);
  const isDraftDnD = post.status === "draft" && !!draftHandleProps;

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
      className={isDraftDnD ? "post-card post-card--draft-dnd" : "post-card"}
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
        <div className="post-card-footer">
          <div className="post-meta">
            {statusEl}
            {post.status === "published" ? (
              <>
                <span>·</span>
                <span>{post.date}</span>
              </>
            ) : null}
            {post.rubric ? (
              <>
                <span>·</span>
                <span className="tag-pill">{post.rubric}</span>
              </>
            ) : null}
          </div>
          {metrics}
        </div>
      </div>
    </div>
  );
}
