"use client";

import { useCallback, useRef, useState } from "react";
import type { BodyLine, CellPos } from "@/shared/lib/noteEmbeds/types";

type ImageDropSlot = { line: number; slot: number };
import type { NoteFile } from "@/shared/types";

/** Drag-and-drop session state for note body embeds. */
export function useNoteBodyDragDropState() {
  const dragFromRef = useRef<CellPos | null>(null);
  const dragSourceRef = useRef<CellPos | null>(null);
  const imageDropSlotRef = useRef<ImageDropSlot | null>(null);
  const dropLineBeforeRef = useRef<number | null>(null);
  const dropCommittedRef = useRef<CellPos | null>(null);
  const pointerDragSessionRef = useRef(false);
  const dragMovedRef = useRef(false);

  const [dragFrom, setDragFrom] = useState<CellPos | null>(null);
  const [dropBefore, setDropBefore] = useState<CellPos | null>(null);
  const [imageDropSlot, setImageDropSlot] = useState<ImageDropSlot | null>(null);
  const [dropLineBefore, setDropLineBefore] = useState<number | null>(null);

  const clearDrag = useCallback(() => {
    dragFromRef.current = null;
    dragSourceRef.current = null;
    imageDropSlotRef.current = null;
    dropLineBeforeRef.current = null;
    dropCommittedRef.current = null;
    setDragFrom(null);
    setDropBefore(null);
    setImageDropSlot(null);
    setDropLineBefore(null);
    pointerDragSessionRef.current = false;
    dragMovedRef.current = false;
  }, []);

  return {
    dragFromRef,
    dragSourceRef,
    imageDropSlotRef,
    dropLineBeforeRef,
    dropCommittedRef,
    pointerDragSessionRef,
    dragMovedRef,
    dragFrom,
    setDragFrom,
    dropBefore,
    setDropBefore,
    imageDropSlot,
    setImageDropSlot,
    dropLineBefore,
    setDropLineBefore,
    isDragging: dragFrom != null,
    clearDrag,
    linesRef: useRef<BodyLine[]>([]),
    filesRef: useRef<NoteFile[]>([]),
  };
}
