"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EMBED_MIME, TEXT_DROP_BOUNDARY_FRAC, VIEW_EMBED_DRAG_THRESHOLD_SQ } from "@/widgets/note-editor/ui/noteBodyEditor/constants";
import {
  hitTestLine,
  isImageGridLineBeforeDrop,
  normalizeImageGridAdjacentNoop,
  resolveFlexEmbedDrop,
  resolveImageGridSlot,
  stabilizeDropBeforeCommitted,
  textLineCellMetrics,
} from "@/widgets/note-editor/ui/noteBodyEditor/dropUtils";
import type { CurrentDropTarget, ImageDropSlot, NoteBodyEditorProps } from "@/widgets/note-editor/ui/noteBodyEditor/types";
import {
  dropBeforeToImageSlot,
  findNoteFile,
  imageGridSlotToDropBefore,
  insertEmbedAt,
  isDropNoop,
  isImageEmbedRow,
  isTextLine,
  linesToBody,
  moveEmbedAt,
  moveEmbedToImageGridSlot,
  moveEmbedToLineBefore,
  parseNoteBody,
  segmentsToLines,
  splitLineAtCaret,
  type BodyLine,
  type CellPos,
} from "@/shared/lib/noteEmbeds";
import type { NoteFile } from "@/shared/types";

export function useNoteBodyEditor({
  body,
  files,
  isView,
  onBodyChange,
  onAddFile,
  onEditRequest,
  focusRequest = 0,
}: NoteBodyEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<BodyLine[]>([]);
  const filesRef = useRef<NoteFile[]>(files);
  const handledFocusRequestRef = useRef(0);
  const pendingTextFocusRef = useRef<CellPos | null>(null);
  const dragFromRef = useRef<CellPos | null>(null);
  /** Сохраняем источник до dragEnd, иначе drop воспринимается как вставку копии. */
  const dragSourceRef = useRef<CellPos | null>(null);
  const imageDropSlotRef = useRef<ImageDropSlot | null>(null);
  const dropLineBeforeRef = useRef<number | null>(null);
  const currentDropRef = useRef<CurrentDropTarget | null>(null);
  const committedSlotRef = useRef<number | null>(null);
  const dropCommittedRef = useRef<CellPos | null>(null);
  const pointerDragSessionRef = useRef(false);
  const pointerCaptureElRef = useRef<HTMLElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  /** Позиция плавающего превью: только ref + стили у узла, без setState на каждый pointermove (иначе вся сетка с img перерисовывается и «дрожит»). */
  const dragFloatRef = useRef<HTMLDivElement | null>(null);
  const dragFloatPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const syncDragFloatPosition = useCallback((x: number, y: number) => {
    dragFloatPosRef.current = { x, y };
    const el = dragFloatRef.current;
    if (el) {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    }
  }, []);

  const dragFloatMountRef = useCallback((el: HTMLDivElement | null) => {
    dragFloatRef.current = el;
    if (el) {
      const p = dragFloatPosRef.current;
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
    }
  }, []);

  const lines = useMemo(() => segmentsToLines(parseNoteBody(body)), [body]);
  linesRef.current = lines;
  filesRef.current = files;

  const [dragFrom, setDragFrom] = useState<CellPos | null>(null);
  const [dropBefore, setDropBefore] = useState<CellPos | null>(null);
  const [imageDropSlot, setImageDropSlot] = useState<ImageDropSlot | null>(null);
  const [dropLineBefore, setDropLineBefore] = useState<number | null>(null);

  const isDragging = dragFrom != null;

  const applyLines = useCallback(
    (next: BodyLine[]) => {
      onBodyChange(linesToBody(next));
    },
    [onBodyChange],
  );

  const handleTextEnter = useCallback(
    (pos: CellPos, offset: number) => {
      pendingTextFocusRef.current = { line: pos.line + 1, cell: 0 };
      applyLines(splitLineAtCaret(linesRef.current, pos, offset));
    },
    [applyLines],
  );

  useLayoutEffect(() => {
    const target = pendingTextFocusRef.current;
    if (!target || isView) return;
    pendingTextFocusRef.current = null;
    requestAnimationFrame(() => {
      const textarea = canvasRef.current?.querySelector<HTMLTextAreaElement>(
        `.note-body-cell--text[data-line="${target.line}"][data-cell="${target.cell}"] .note-body-line-edit`,
      );
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(0, 0);
    });
  }, [lines, isView]);

  const clearDrag = useCallback(() => {
    dragFromRef.current = null;
    dragSourceRef.current = null;
    imageDropSlotRef.current = null;
    dropLineBeforeRef.current = null;
    currentDropRef.current = null;
    committedSlotRef.current = null;
    dropCommittedRef.current = null;
    setDragFrom(null);
    setDropBefore(null);
    setImageDropSlot(null);
    setDropLineBefore(null);
    pointerDragSessionRef.current = false;
    pointerCaptureElRef.current = null;
    activePointerIdRef.current = null;
    dragMovedRef.current = false;
  }, []);

  const setImageSlot = useCallback((line: number, slot: number) => {
    const prev = imageDropSlotRef.current;
    if (dropLineBeforeRef.current != null) {
      dropLineBeforeRef.current = null;
      setDropLineBefore(null);
    }
    if (prev?.line === line && prev?.slot === slot) return;
    imageDropSlotRef.current = { line, slot };
    setImageDropSlot({ line, slot });
  }, []);

  const resolveDropBefore = useCallback((clientX: number, clientY: number): CellPos => {
    const from = dragSourceRef.current ?? dragFromRef.current;
    const curLines = linesRef.current;
    const curFiles = filesRef.current;

    const hit = hitTestLine(clientX, clientY, curLines, curFiles);
    const slotState = imageDropSlotRef.current;

    if (hit?.lineEl.dataset.dropTail === "1") {
      return { line: curLines.length, cell: 0 };
    }

    if (hit?.isImageGrid && from && isImageGridLineBeforeDrop(clientY, hit.lineEl)) {
      return { line: hit.lineIndex, cell: 0 };
    }

    if (hit && slotState && slotState.line === hit.lineIndex && isImageEmbedRow(hit.line, curFiles)) {
      return imageGridSlotToDropBefore(hit.line, hit.lineIndex, slotState.slot, from);
    }

    if (!hit) return { line: curLines.length, cell: 0 };

    if (isTextLine(hit.line)) {
      const { top, height: h } = textLineCellMetrics(hit.lineEl);
      const boundaryY = top + h * TEXT_DROP_BOUNDARY_FRAC;
      if (clientY < boundaryY) return { line: hit.lineIndex, cell: 0 };
      return { line: hit.lineIndex + 1, cell: 0 };
    }

    if (hit.isImageGrid && from) {
      const slot = resolveImageGridSlot(
        clientX,
        hit.lineEl,
        hit.lineIndex,
        hit.line,
        dragSourceRef.current ?? dragFromRef.current,
        committedSlotRef,
        imageDropSlotRef,
      );
      return imageGridSlotToDropBefore(hit.line, hit.lineIndex, slot, from);
    }

    if (from) return resolveFlexEmbedDrop(clientX, hit.line, hit.lineIndex);
    return { line: hit.lineIndex, cell: 0 };
  }, []);

  const commitDropAt = useCallback(
    (before: CellPos, embedName?: string) => {
      const from = dragSourceRef.current ?? dragFromRef.current;
      const curLines = linesRef.current;
      const curFiles = filesRef.current;
      const currentDrop = currentDropRef.current;
      const lineBefore = currentDrop?.type === "lineBefore" ? currentDrop.line : null;
      const rawCommittedBefore = currentDrop?.type === "before" ? currentDrop.before : before;
      const committedBefore =
        from != null && dragMovedRef.current
          ? normalizeImageGridAdjacentNoop(from, rawCommittedBefore, curLines, curFiles)
          : rawCommittedBefore;

      if (from != null) {
        if (lineBefore != null) {
          applyLines(moveEmbedToLineBefore(curLines, from, lineBefore, curFiles));
        } else if (currentDrop?.type === "imageSlot") {
          applyLines(moveEmbedToImageGridSlot(curLines, from, currentDrop.line, currentDrop.slot, curFiles));
        } else if (!isDropNoop(from, committedBefore)) {
          applyLines(moveEmbedAt(curLines, from, committedBefore, curFiles));
        }
      } else if (embedName && findNoteFile(curFiles, embedName)) {
        applyLines(insertEmbedAt(curLines, committedBefore, embedName, curFiles));
      }
      clearDrag();
    },
    [applyLines, clearDrag],
  );

  const updateDropTarget = useCallback(
    (clientX: number, clientY: number) => {
      const hit = hitTestLine(clientX, clientY, linesRef.current, filesRef.current);
      const lineBefore =
        hit?.isImageGrid && dragSourceRef.current != null && isImageGridLineBeforeDrop(clientY, hit.lineEl)
          ? hit.lineIndex
          : null;

      if (lineBefore != null) {
        if (imageDropSlotRef.current != null) {
          imageDropSlotRef.current = null;
          setImageDropSlot(null);
        }
        currentDropRef.current = { type: "lineBefore", line: lineBefore };
        if (dropLineBeforeRef.current !== lineBefore) {
          dropLineBeforeRef.current = lineBefore;
          setDropLineBefore(lineBefore);
        }
      } else {
        if (dropLineBeforeRef.current != null) {
          dropLineBeforeRef.current = null;
          setDropLineBefore(null);
        }
      }

      if (hit?.isImageGrid && lineBefore == null) {
        const from = dragSourceRef.current ?? dragFromRef.current;
        const slot = resolveImageGridSlot(
          clientX,
          hit.lineEl,
          hit.lineIndex,
          hit.line,
          from,
          committedSlotRef,
          imageDropSlotRef,
        );
        const before = imageGridSlotToDropBefore(hit.line, hit.lineIndex, slot, from);
        currentDropRef.current = { type: "imageSlot", line: hit.lineIndex, slot };
        dropCommittedRef.current = before;
        setDropBefore((prev) =>
          prev && prev.line === before.line && prev.cell === before.cell ? prev : before,
        );
        setImageSlot(hit.lineIndex, slot);
        return;
      } else if (imageDropSlotRef.current != null) {
        imageDropSlotRef.current = null;
        setImageDropSlot(null);
      }

      if (dragSourceRef.current != null) {
        const raw = resolveDropBefore(clientX, clientY);
        const stable = stabilizeDropBeforeCommitted(
          dropCommittedRef.current,
          raw,
          clientX,
          clientY,
          linesRef.current,
          filesRef.current,
        );
        dropCommittedRef.current = stable;
        currentDropRef.current = { type: "before", before: stable };
        setDropBefore((prev) =>
          prev && prev.line === stable.line && prev.cell === stable.cell ? prev : stable,
        );
      }
    },
    [resolveDropBefore, setImageSlot],
  );

  const resolveDropForCommit = useCallback((clientX: number, clientY: number): CellPos => {
    const from = dragSourceRef.current ?? dragFromRef.current;
    const curLines = linesRef.current;
    const curFiles = filesRef.current;
    const hit = hitTestLine(clientX, clientY, curLines, curFiles);

    if (hit?.isImageGrid && from) {
      if (isImageGridLineBeforeDrop(clientY, hit.lineEl)) {
        imageDropSlotRef.current = null;
        dropLineBeforeRef.current = hit.lineIndex;
        const before = { line: hit.lineIndex, cell: 0 };
        dropCommittedRef.current = before;
        currentDropRef.current = { type: "lineBefore", line: hit.lineIndex };
        return before;
      }

      const slot = resolveImageGridSlot(
        clientX,
        hit.lineEl,
        hit.lineIndex,
        hit.line,
        from,
        committedSlotRef,
        imageDropSlotRef,
      );
      imageDropSlotRef.current = { line: hit.lineIndex, slot };
      dropLineBeforeRef.current = null;
      const before = imageGridSlotToDropBefore(hit.line, hit.lineIndex, slot, from);
      dropCommittedRef.current = before;
      currentDropRef.current = { type: "imageSlot", line: hit.lineIndex, slot };
      return before;
    }

    if (currentDropRef.current?.type === "before") return currentDropRef.current.before;
    if (currentDropRef.current?.type === "imageSlot") {
      const line = curLines[currentDropRef.current.line];
      if (line) return imageGridSlotToDropBefore(line, currentDropRef.current.line, currentDropRef.current.slot, from);
    }
    if (currentDropRef.current?.type === "lineBefore") return { line: currentDropRef.current.line, cell: 0 };
    return dropCommittedRef.current ?? resolveDropBefore(clientX, clientY);
  }, [resolveDropBefore]);

  const performDrop = useCallback(
    (clientX: number, clientY: number, dataTransfer: DataTransfer | null) => {
      const before = dragSourceRef.current != null
        ? resolveDropForCommit(clientX, clientY)
        : resolveDropBefore(clientX, clientY);

      if (dataTransfer?.files?.length) {
        const file = dataTransfer.files[0];
        if (file) {
          const entry = onAddFile(file);
          commitDropAt(before, entry.name);
        }
        return;
      }

      const embedName = dataTransfer?.getData(EMBED_MIME) || undefined;
      commitDropAt(before, embedName || undefined);
    },
    [commitDropAt, onAddFile, resolveDropBefore, resolveDropForCommit],
  );

  const initEmbedDragSession = useCallback(
    (pos: CellPos, lineCtx?: BodyLine, lineIndexCtx?: number, overlayPos?: { x: number; y: number }) => {
      dragSourceRef.current = pos;
      dragFromRef.current = pos;
      dragMovedRef.current = false;
      dropLineBeforeRef.current = null;
      currentDropRef.current = { type: "before", before: { line: pos.line, cell: pos.cell } };
      committedSlotRef.current = null;
      dropCommittedRef.current = { line: pos.line, cell: pos.cell };
      setDropBefore({ line: pos.line, cell: pos.cell });
      setDropLineBefore(null);
      setDragFrom(pos);
      if (overlayPos) {
        dragFloatPosRef.current = overlayPos;
        syncDragFloatPosition(overlayPos.x, overlayPos.y);
      }

      const curFiles = filesRef.current;
      if (
        lineCtx != null &&
        lineIndexCtx !== undefined &&
        isImageEmbedRow(lineCtx, curFiles)
      ) {
        const startSlot = dropBeforeToImageSlot(
          lineCtx,
          lineIndexCtx,
          { line: lineIndexCtx, cell: pos.cell },
          null,
        );
        imageDropSlotRef.current = { line: lineIndexCtx, slot: startSlot };
        setImageDropSlot({ line: lineIndexCtx, slot: startSlot });
      } else {
        imageDropSlotRef.current = null;
        setImageDropSlot(null);
      }
    },
    [syncDragFloatPosition],
  );

  const runEmbedPointerDrag = useCallback(
    (
      pos: CellPos,
      lineCtx: BodyLine | undefined,
      lineIndexCtx: number | undefined,
      pointerId: number,
      clientX: number,
      clientY: number,
      captureFallbackEl: HTMLElement | null,
    ) => {
      if (pointerDragSessionRef.current) return;

      pointerDragSessionRef.current = true;
      /** Захват на body: иначе после re-render ячейка с opacity:0 и поток событий обрывается. */
      const captureEl =
        typeof document !== "undefined" ? document.body : captureFallbackEl;
      pointerCaptureElRef.current = captureEl ?? captureFallbackEl;
      activePointerIdRef.current = pointerId;
      try {
        captureEl?.setPointerCapture(pointerId);
      } catch {
        try {
          if (captureFallbackEl) {
            captureFallbackEl.setPointerCapture(pointerId);
            pointerCaptureElRef.current = captureFallbackEl;
          }
        } catch {
          /* ignore */
        }
      }

      initEmbedDragSession(pos, lineCtx, lineIndexCtx, { x: clientX, y: clientY });

      const capEl = pointerCaptureElRef.current;
      if (!capEl) {
        pointerDragSessionRef.current = false;
        return;
      }
      const capTarget = capEl;

      let finished = false;

      function teardown() {
        if (finished) return;
        finished = true;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        capTarget.removeEventListener("lostpointercapture", onLostCapture);
      }

      function onLostCapture(ev: PointerEvent) {
        if (ev.pointerId !== activePointerIdRef.current) return;
        teardown();
        pointerCaptureElRef.current = null;
        activePointerIdRef.current = null;
        pointerDragSessionRef.current = false;
        clearDrag();
      }

      function onMove(ev: PointerEvent) {
        if (ev.pointerId !== activePointerIdRef.current) return;
        ev.preventDefault();
        dragMovedRef.current = true;
        syncDragFloatPosition(ev.clientX, ev.clientY);
        updateDropTarget(ev.clientX, ev.clientY);
      }

      function onUp(ev: PointerEvent) {
        if (ev.pointerId !== activePointerIdRef.current) return;
        teardown();

        const cap = pointerCaptureElRef.current;
        const pid = ev.pointerId;
        pointerCaptureElRef.current = null;
        activePointerIdRef.current = null;
        pointerDragSessionRef.current = false;
        try {
          cap?.releasePointerCapture(pid);
        } catch {
          /* released */
        }

        const before = resolveDropForCommit(ev.clientX, ev.clientY);
        commitDropAt(before);
      }

      capTarget.addEventListener("lostpointercapture", onLostCapture);

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clearDrag, commitDropAt, initEmbedDragSession, resolveDropForCommit, syncDragFloatPosition, updateDropTarget],
  );

  const beginEmbedPointerDrag = useCallback(
    (pos: CellPos, e: React.PointerEvent, lineCtx?: BodyLine, lineIndexCtx?: number) => {
      if (pointerDragSessionRef.current) return;
      if (e.button !== 0) return;

      const fallback = e.currentTarget instanceof HTMLElement ? e.currentTarget : null;

      if (!isView) {
        e.preventDefault();
        e.stopPropagation();
        runEmbedPointerDrag(
          pos,
          lineCtx,
          lineIndexCtx,
          e.pointerId,
          e.clientX,
          e.clientY,
          fallback,
        );
        return;
      }

      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const pid = e.pointerId;

      const onTentativeMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pid) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (dx * dx + dy * dy < VIEW_EMBED_DRAG_THRESHOLD_SQ) return;
        window.removeEventListener("pointermove", onTentativeMove);
        window.removeEventListener("pointerup", onTentativeUp);
        window.removeEventListener("pointercancel", onTentativeUp);
        ev.preventDefault();
        runEmbedPointerDrag(
          pos,
          lineCtx,
          lineIndexCtx,
          pid,
          ev.clientX,
          ev.clientY,
          fallback,
        );
      };

      const onTentativeUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pid) return;
        window.removeEventListener("pointermove", onTentativeMove);
        window.removeEventListener("pointerup", onTentativeUp);
        window.removeEventListener("pointercancel", onTentativeUp);
      };

      window.addEventListener("pointermove", onTentativeMove, { passive: false });
      window.addEventListener("pointerup", onTentativeUp);
      window.addEventListener("pointercancel", onTentativeUp);
    },
    [isView, runEmbedPointerDrag],
  );

  useEffect(() => {
    const onDocDragOver = (e: DragEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;

      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = dragFromRef.current != null ? "move" : "copy";
      }
      if (dragSourceRef.current != null) {
        syncDragFloatPosition(e.clientX, e.clientY);
      }
      updateDropTarget(e.clientX, e.clientY);
    };

    const onDocDrop = (e: DragEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      e.preventDefault();
      performDrop(e.clientX, e.clientY, e.dataTransfer);
    };

    document.addEventListener("dragover", onDocDragOver);
    document.addEventListener("drop", onDocDrop);
    return () => {
      document.removeEventListener("dragover", onDocDragOver);
      document.removeEventListener("drop", onDocDrop);
    };
  }, [performDrop, syncDragFloatPosition, updateDropTarget]);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragFromRef.current != null ? "move" : "copy";
    if (dragSourceRef.current != null) {
      syncDragFloatPosition(e.clientX, e.clientY);
    }
    updateDropTarget(e.clientX, e.clientY);
  };

  const hasContent = lines.some((l) => l.cells.some((c) => (c.type === "text" ? c.content.trim() : true)));

  const draggedEmbedCell =
    dragFrom != null && lines[dragFrom.line]?.cells[dragFrom.cell]?.type === "embed"
      ? lines[dragFrom.line]!.cells[dragFrom.cell]!
      : null;

  const dropGapActive = dragFrom != null && dropBefore != null && !isDropNoop(dragFrom, dropBefore);
  const dropLineBeforeActive = dragFrom != null && dropLineBefore != null;

  const handleViewMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isView && e.detail > 1) e.preventDefault();
    },
    [isView],
  );

  const handleViewDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    if (isView) onEditRequest?.();
  }, [isView, onEditRequest]);

  useEffect(() => {
    if (isView || focusRequest <= handledFocusRequestRef.current) return;
    handledFocusRequestRef.current = focusRequest;
    requestAnimationFrame(() => {
      const firstLine = canvasRef.current?.querySelector<HTMLTextAreaElement>(".note-body-line-edit");
      if (!firstLine) return;
      firstLine.focus();
      const end = firstLine.value.length;
      firstLine.setSelectionRange(end, end);
    });
  }, [focusRequest, isView]);

  return {
    canvasRef,
    lines,
    files,
    isView,
    isDragging,
    hasContent,
    dragFrom,
    dropBefore,
    imageDropSlot,
    dropLineBefore,
    dropGapActive,
    dropLineBeforeActive,
    draggedEmbedCell,
    dragFloatMountRef,
    applyLines,
    handleTextEnter,
    beginEmbedPointerDrag,
    handleCanvasDragOver,
    handleViewMouseDown,
    handleViewDoubleClick,
  };
}
