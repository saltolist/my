"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const committedSlotRef = useRef<number | null>(null);

  /** Прокрутка ленты у верха/низа экрана и у краёв блока ленты во время drag */
  const onDocumentDragOverForFeedScroll = useCallback((e: DragEvent) => {
    if (draggingIdRef.current == null) return;
    const feed = document.getElementById("feed-scroll") as HTMLElement | null;
    if (!feed) return;
    const y = e.clientY;
    const vh = window.innerHeight;
    const fr = feed.getBoundingClientRect();
    const EDGE_VIEW = 80;
    const INNER = 56;
    const MAX_STEP = 26;
    let delta = 0;
    if (y < EDGE_VIEW) {
      delta = -Math.ceil((MAX_STEP * (EDGE_VIEW - y)) / EDGE_VIEW);
    } else if (y < fr.top + INNER) {
      const span = Math.max(1, fr.top + INNER);
      delta = -Math.ceil((MAX_STEP * (span - y)) / INNER);
    } else if (y > vh - EDGE_VIEW) {
      delta = Math.ceil((MAX_STEP * (y - (vh - EDGE_VIEW))) / EDGE_VIEW);
    } else if (y > fr.bottom - INNER) {
      const span = Math.max(1, INNER);
      delta = Math.ceil((MAX_STEP * (y - (fr.bottom - INNER))) / span);
    }
    if (delta !== 0) {
      feed.scrollTop += delta;
    }
  }, []);

  const setIndicatorBoth = useCallback((next: { beforeId: number | null } | null) => {
    indicatorRef.current = next;
    setIndicator(next);
  }, []);

  const onDragStart = (id: number) => (e: React.DragEvent) => {
    draggingIdRef.current = id;
    committedSlotRef.current = null;
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

    document.addEventListener("dragover", onDocumentDragOverForFeedScroll, true);
  };

  const onDragEnd = (id: number) => () => {
    document.removeEventListener("dragover", onDocumentDragOverForFeedScroll, true);
    draggingIdRef.current = null;
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
    const el = cardRefs.current.get(id);
    if (el) el.classList.remove("is-dragging");
    setIndicatorBoth(null);
    committedSlotRef.current = null;
  };

  const slotToBeforeId = (slot: number, orderedIds: number[]): number | null => {
    if (slot >= orderedIds.length) return null;
    return orderedIds[slot];
  };

  /** Гистерезис: слот сдвигается по границам mids только после HY px «перетяга» */
  const stabilizeSlot = (y: number, rawSlot: number, mids: number[], n: number): number => {
    const HY = 12;
    if (n <= 1) {
      committedSlotRef.current = rawSlot;
      return rawSlot;
    }
    let slot = committedSlotRef.current ?? rawSlot;
    if (rawSlot > slot) {
      while (slot < rawSlot) {
        if (y >= mids[slot] + HY) slot++;
        else break;
      }
    } else if (rawSlot < slot) {
      while (slot > rawSlot) {
        if (y <= mids[slot - 1] - HY) slot--;
        else break;
      }
    }
    committedSlotRef.current = slot;
    return slot;
  };

  const yToRawSlot = (y: number, items: { id: number; r: DOMRect }[]): number => {
    const n = items.length;
    if (n === 0) return 0;
    if (n === 1) return y < items[0].r.bottom ? 0 : 1;
    const mids: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      mids.push((items[i].r.bottom + items[i + 1].r.top) / 2);
    }
    if (y < mids[0]) return 0;
    for (let i = 1; i < mids.length; i++) {
      if (y < mids[i]) return i;
    }
    if (y < items[n - 1].r.bottom) return n - 1;
    return n;
  };

  const onDraftsDragOver = (e: React.DragEvent) => {
    const dragId = draggingIdRef.current;
    if (dragId == null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const items = drafts
      .map((d) => {
        const el = cardRefs.current.get(d.id);
        const r = el?.getBoundingClientRect();
        return r && r.height > 0 ? { id: d.id, r } : null;
      })
      .filter((x): x is { id: number; r: DOMRect } => x != null);

    if (items.length === 0) {
      setIndicatorBoth(null);
      return;
    }

    const y = e.clientY;
    const n = items.length;
    const mids: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      mids.push((items[i].r.bottom + items[i + 1].r.top) / 2);
    }

    const raw = yToRawSlot(y, items);
    const slot = stabilizeSlot(y, raw, mids, n);
    const orderedIds = items.map((x) => x.id);
    let beforeId = slotToBeforeId(slot, orderedIds);

    if (beforeId === dragId) {
      const idx = orderedIds.indexOf(dragId);
      const nextId = idx >= 0 ? orderedIds[idx + 1] : null;
      beforeId = nextId ?? null;
    }

    const next = { beforeId };
    const cur = indicatorRef.current;
    if (cur?.beforeId === next.beforeId) return;
    setIndicatorBoth(next);
  };

  const onDrop = (e: React.DragEvent) => {
    const dragId = draggingIdRef.current;
    if (dragId == null) return;
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("dragover", onDocumentDragOverForFeedScroll, true);
    reorder(dragId, indicatorRef.current?.beforeId ?? null);
    draggingIdRef.current = null;
    setIndicatorBoth(null);
    committedSlotRef.current = null;
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

  useEffect(() => {
    return () => {
      document.removeEventListener("dragover", onDocumentDragOverForFeedScroll, true);
    };
  }, [onDocumentDragOverForFeedScroll]);

  return (
    <div className="feed-section">
      <div className="section-label">Черновики</div>
      <div
        className="feed-section-cards draft-cards-stack"
        ref={containerRef}
        onDragOver={onDraftsDragOver}
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
