"use client";

import { useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

export default function DraftsSection({ drafts }: { drafts: Post[] }) {
  const { state, dispatch, openPost } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [indicator, setIndicator] = useState<{ beforeId: number | null } | null>(null);

  const enableDrag = (id: number) => {
    const el = cardRefs.current.get(id);
    if (el) el.setAttribute("draggable", "true");
  };

  const disableDrag = (id: number) => {
    const el = cardRefs.current.get(id);
    if (el) el.setAttribute("draggable", "false");
  };

  const onDragStart = (id: number) => (e: React.DragEvent) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch {}
    requestAnimationFrame(() => {
      const el = cardRefs.current.get(id);
      if (el) el.classList.add("is-dragging");
    });
  };

  const onDragEnd = (id: number) => () => {
    const el = cardRefs.current.get(id);
    if (el) {
      el.classList.remove("is-dragging");
      el.setAttribute("draggable", "false");
    }
    setIndicator(null);
    setDraggingId(null);
  };

  const onDragOverCard = (id: number) => (e: React.DragEvent) => {
    if (draggingId == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id === draggingId) {
      setIndicator(null);
      return;
    }
    const el = cardRefs.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const before = e.clientY - rect.top < rect.height / 2;
    if (before) {
      setIndicator({ beforeId: id });
    } else {
      const idx = drafts.findIndex((d) => d.id === id);
      const next = drafts[idx + 1];
      setIndicator({ beforeId: next ? next.id : null });
    }
  };

  const onContainerDragOver = (e: React.DragEvent) => {
    if (draggingId == null) return;
    const target = e.target as HTMLElement;
    if (!target.closest(".post-card[data-draft-id]")) {
      e.preventDefault();
      setIndicator({ beforeId: null });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    if (draggingId == null) return;
    e.preventDefault();
    reorder(draggingId, indicator?.beforeId ?? null);
    setIndicator(null);
    setDraggingId(null);
  };

  const reorder = (sourceId: number, beforeId: number | null) => {
    if (sourceId === beforeId) return;
    const posts = [...state.posts];
    const srcIdx = posts.findIndex((p) => p.id === sourceId);
    if (srcIdx === -1) return;
    const [item] = posts.splice(srcIdx, 1);
    let insertAt: number;
    if (beforeId == null) {
      let lastDraftIdx = -1;
      posts.forEach((p, i) => {
        if (p.status === "draft") lastDraftIdx = i;
      });
      insertAt = lastDraftIdx + 1;
    } else {
      insertAt = posts.findIndex((p) => p.id === beforeId);
      if (insertAt < 0) insertAt = posts.length;
    }
    posts.splice(insertAt, 0, item);
    dispatch({ type: "REORDER_POSTS", posts });
  };

  return (
    <div className="feed-section">
      <div className="section-label">Черновики</div>
      <div
        className="feed-section-cards"
        ref={containerRef}
        onDragOver={onContainerDragOver}
        onDrop={onDrop}
      >
        {drafts.map((p) => (
          <DraftCardSlot
            key={p.id}
            indicatorBefore={indicator?.beforeId === p.id}
          >
            <div
              ref={(el) => {
                if (el) cardRefs.current.set(p.id, el);
                else cardRefs.current.delete(p.id);
              }}
              data-draft-id={p.id}
              onDragStart={onDragStart(p.id)}
              onDragEnd={onDragEnd(p.id)}
              onDragOver={onDragOverCard(p.id)}
              onMouseUp={() => disableDrag(p.id)}
            >
              <PostCard
                post={p}
                onOpen={() => openPost(p.id)}
                draftHandleProps={{
                  onMouseDown: () => enableDrag(p.id),
                  onClickStop: (e) => e.stopPropagation(),
                }}
              />
            </div>
          </DraftCardSlot>
        ))}
        {indicator && indicator.beforeId == null ? <div className="drop-indicator" /> : null}
      </div>
    </div>
  );
}

function DraftCardSlot({
  indicatorBefore,
  children,
}: {
  indicatorBefore: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {indicatorBefore ? <div className="drop-indicator" /> : null}
      {children}
    </>
  );
}
