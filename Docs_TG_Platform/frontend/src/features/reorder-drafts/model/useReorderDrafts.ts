"use client";

import { useCallback, useRef, useState } from "react";
import { usePosts, useReorderPosts } from "@/entities/post/model/usePosts";
import type { Post } from "@/shared/types";

function reorderDraftsInPosts(posts: Post[], sourceId: number, targetId: number | null): Post[] {
  if (sourceId === targetId) return posts;

  const next = [...posts];
  const srcIdx = next.findIndex((p) => p.id === sourceId);
  if (srcIdx === -1) return posts;

  const [item] = next.splice(srcIdx, 1);

  let insertAt: number;
  if (targetId == null) {
    let lastDraftIdx = -1;
    next.forEach((p, i) => {
      if (p.status === "draft") lastDraftIdx = i;
    });
    insertAt = lastDraftIdx + 1;
  } else {
    insertAt = next.findIndex((p) => p.id === targetId);
    if (insertAt < 0) insertAt = next.length;
  }

  next.splice(insertAt, 0, item);
  return next;
}

export function useReorderDrafts(drafts: Post[]) {
  const { data: posts = [] } = usePosts();
  const reorderMutation = useReorderPosts();
  const draggingIdRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropBeforeId, setDropBeforeId] = useState<number | null>(null);

  const reorder = useCallback(
    (sourceId: number, beforeId: number | null) => {
      const nextPosts = reorderDraftsInPosts(posts, sourceId, beforeId);
      if (nextPosts !== posts) {
        reorderMutation.mutate(nextPosts);
      }
    },
    [posts, reorderMutation],
  );

  const onDragStart = useCallback(
    (id: number) => (e: React.DragEvent) => {
      e.stopPropagation();
      draggingIdRef.current = id;
      setDraggingId(id);
      setDropBeforeId(id);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", String(id));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const onDragEnd = useCallback(() => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropBeforeId(null);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (draggingIdRef.current == null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const container = e.currentTarget as HTMLElement;
      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-draft-id]"));
      const visible = drafts.filter((d) => d.id !== draggingIdRef.current);
      const y = e.clientY;

      let beforeId: number | null = null;
      for (const card of cards) {
        const id = Number(card.dataset.draftId);
        if (id === draggingIdRef.current) continue;
        const rect = card.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (y < mid) {
          beforeId = id;
          break;
        }
      }

      setDropBeforeId(beforeId);
    },
    [drafts],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const sourceId = draggingIdRef.current;
      if (sourceId == null) return;
      reorder(sourceId, dropBeforeId === sourceId ? null : dropBeforeId);
      onDragEnd();
    },
    [dropBeforeId, onDragEnd, reorder],
  );

  const displayDrafts = (() => {
    if (draggingId == null || dropBeforeId == null || draggingId === dropBeforeId) {
      return drafts;
    }
    const without = drafts.filter((d) => d.id !== draggingId);
    const dragged = drafts.find((d) => d.id === draggingId);
    if (!dragged) return drafts;

    const idx = dropBeforeId == null ? without.length : without.findIndex((d) => d.id === dropBeforeId);
    const insertAt = idx < 0 ? without.length : idx;
    const result = [...without];
    result.splice(insertAt, 0, dragged);
    return result;
  })();

  return {
    draggingId,
    displayDrafts,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    isReordering: reorderMutation.isPending,
  };
}
