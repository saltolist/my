"use client";

import { useCallback, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

export default function DraftsSection({ drafts }: { drafts: Post[] }) {
  const { state, dispatch, openPost } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const draggingIdRef = useRef<number | null>(null);
  const indicatorRef = useRef<{ beforeId: number | null } | null>(null);
  const [indicator, setIndicator] = useState<{ beforeId: number | null } | null>(null);

  const dragGhostRef = useRef<HTMLElement | null>(null);

  const setIndicatorBoth = useCallback((next: { beforeId: number | null } | null) => {
    indicatorRef.current = next;
    setIndicator(next);
  }, []);

  const onDragStart = (id: number) => (e: React.DragEvent) => {
    draggingIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch {
      /* ignore */
    }

    const wrap = cardRefs.current.get(id);
    if (wrap) {
      dragGhostRef.current?.remove();
      const ghost = wrap.cloneNode(true) as HTMLElement;
      ghost.classList.remove("is-dragging");
      ghost.classList.add("draft-drag-preview");
      ghost.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      ghost.querySelectorAll("[draggable]").forEach((el) => el.removeAttribute("draggable"));

      const rect = wrap.getBoundingClientRect();
      ghost.style.boxSizing = "border-box";
      ghost.style.position = "fixed";
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.pointerEvents = "none";
      ghost.style.margin = "0";
      ghost.style.zIndex = "2147483647";
      document.body.appendChild(ghost);
      void ghost.offsetHeight;
      const gr = ghost.getBoundingClientRect();
      let hx = e.clientX - gr.left;
      let hy = e.clientY - gr.top;
      const w = Math.max(1, gr.width);
      const h = Math.max(1, gr.height);
      hx = Math.max(0, Math.min(hx, w - 1));
      hy = Math.max(0, Math.min(hy, h - 1));
      try {
        e.dataTransfer.setDragImage(ghost, hx, hy);
        dragGhostRef.current = ghost;
        requestAnimationFrame(() => {
          ghost.style.opacity = "0";
          ghost.style.visibility = "hidden";
          ghost.style.left = "-9999px";
          ghost.style.top = "0";
        });
      } catch {
        ghost.remove();
        dragGhostRef.current = null;
      }
    }

    requestAnimationFrame(() => {
      const el = cardRefs.current.get(id);
      if (el) el.classList.add("is-dragging");
    });
  };

  const onDragEnd = (id: number) => () => {
    draggingIdRef.current = null;
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
    const el = cardRefs.current.get(id);
    if (el) el.classList.remove("is-dragging");
    setIndicatorBoth(null);
  };

  const onDragOverCard = (id: number) => (e: React.DragEvent) => {
    const dragId = draggingIdRef.current;
    if (dragId == null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (id === dragId) {
      setIndicatorBoth(null);
      return;
    }
    const el = cardRefs.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const before = e.clientY - rect.top < rect.height / 2;
    if (before) {
      setIndicatorBoth({ beforeId: id });
    } else {
      const idx = drafts.findIndex((d) => d.id === id);
      const next = drafts[idx + 1];
      setIndicatorBoth({ beforeId: next ? next.id : null });
    }
  };

  const onContainerDragOver = (e: React.DragEvent) => {
    if (draggingIdRef.current == null) return;
    e.preventDefault();
    const overDraft = (e.target as HTMLElement).closest("[data-draft-id]");
    if (overDraft) return;
    e.stopPropagation();
    setIndicatorBoth({ beforeId: null });
  };

  const onDrop = (e: React.DragEvent) => {
    const dragId = draggingIdRef.current;
    if (dragId == null) return;
    e.preventDefault();
    e.stopPropagation();
    reorder(dragId, indicatorRef.current?.beforeId ?? null);
    draggingIdRef.current = null;
    setIndicatorBoth(null);
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
          <DraftCardSlot key={p.id} indicatorBefore={indicator?.beforeId === p.id}>
            <div
              className="draft-card-wrap"
              ref={(el) => {
                if (el) cardRefs.current.set(p.id, el);
                else cardRefs.current.delete(p.id);
              }}
              data-draft-id={p.id}
              onDragOver={onDragOverCard(p.id)}
              onDrop={onDrop}
            >
              <PostCard
                post={p}
                onOpen={() => openPost(p.id)}
                draftHandleProps={{
                  onClickStop: (ev) => ev.stopPropagation(),
                  onDragStart: onDragStart(p.id),
                  onDragEnd: onDragEnd(p.id),
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
