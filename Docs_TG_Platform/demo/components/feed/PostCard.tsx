"use client";

import type { Post } from "@/lib/types";

export default function PostCard({
  post,
  onOpen,
  draftHandleProps,
}: {
  post: Post;
  onOpen: () => void;
  draftHandleProps?: {
    onMouseDown: () => void;
    onClickStop: (e: React.MouseEvent) => void;
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

  return (
    <div className="post-card" onClick={onOpen}>
      {post.status === "draft" && draftHandleProps ? (
        <div
          className="drag-handle"
          title="Перетащить"
          onClick={draftHandleProps.onClickStop}
          onMouseDown={draftHandleProps.onMouseDown}
        >
          ⠿
        </div>
      ) : null}
      <div className="post-card-body">
        {post.text ? (
          <div className="post-card-text">{post.text}</div>
        ) : (
          <div className="post-card-text empty">Пост пустой — нажми чтобы начать писать</div>
        )}
        {post.media ? <div className="post-card-media">🖼 {String(post.media)}</div> : null}
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
