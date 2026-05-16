"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { NoteFile } from "@/lib/types";
import {
  buildImageGridSlotLayout,
  dropBeforeToImageSlot,
  EMBED_IMAGE_SLOT_GAP,
  EMBED_IMAGE_SLOT_H,
  EMBED_IMAGE_SLOT_W,
  embedToken,
  findNoteFile,
  imageGridSlotToDropBefore,
  insertEmbedAt,
  isDropNoop,
  isEmbedLine,
  isImageEmbed,
  isImageEmbedRow,
  isTextLine,
  moveEmbedAt,
  moveEmbedToLineBefore,
  MAX_IMAGES_PER_EMBED_ROW,
  parseNoteBody,
  segmentsToLines,
  linesToBody,
  splitLineAtCaret,
  updateTextCell,
  type BodyLine,
  type CellPos,
  type LineCell,
} from "@/lib/noteEmbeds";

const EMBED_MIME = "application/x-note-embed";
/** Граница «перед строкой / после строки» (доля высоты строки сверху). */
const TEXT_DROP_BOUNDARY_FRAC = 0.5;
/**
 * Гистерезис по Y между «вставить перед строкой i» и «после неё» (половина полосы с каждой стороны от границы).
 * Шире — меньше дрожания у середины строки при появлении индикатора дропа.
 */
function textLineDropHysteresisPx(lineHeight: number): number {
  return Math.max(28, lineHeight * 0.28);
}

/** Метрики текста без учёта in-flow индикаторов дропа (они вынесены в absolute). */
function textLineCellMetrics(lineEl: HTMLElement): { top: number; height: number } {
  const cell = lineEl.querySelector<HTMLElement>(".note-body-cell--text");
  const r = (cell ?? lineEl).getBoundingClientRect();
  const h = Math.max(r.height, 8);
  return { top: r.top, height: h };
}

function isImageGridLineBeforeDrop(clientY: number, lineEl: HTMLElement): boolean {
  const r = lineEl.getBoundingClientRect();
  return clientY <= r.top + Math.min(14, r.height * 0.1);
}

const FLEX_DROP_X_HYST_PX = 48;
/** Плавающая карточка и слот вставки при перетаскивании вложения. */
const DRAG_CARD_W = EMBED_IMAGE_SLOT_W;
const DRAG_CARD_H = EMBED_IMAGE_SLOT_H;
/** В режиме просмотра не начинаем drag сразу — иначе ломаются клики по ссылкам на файлы. */
const VIEW_EMBED_DRAG_THRESHOLD_SQ = 36;

type Props = {
  body: string;
  files: NoteFile[];
  isView: boolean;
  onBodyChange: (body: string) => void;
  onAddFile: (file: File) => NoteFile;
};

type ImageDropSlot = { line: number; slot: number };

export default function NoteBodyEditor({ body, files, isView, onBodyChange, onAddFile }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<BodyLine[]>([]);
  const filesRef = useRef<NoteFile[]>(files);
  const dragFromRef = useRef<CellPos | null>(null);
  /** Сохраняем источник до dragEnd, иначе drop воспринимается как вставку копии. */
  const dragSourceRef = useRef<CellPos | null>(null);
  const imageDropSlotRef = useRef<ImageDropSlot | null>(null);
  const dropLineBeforeRef = useRef<number | null>(null);
  const committedSlotRef = useRef<number | null>(null);
  const dropCommittedRef = useRef<CellPos | null>(null);
  const pointerDragSessionRef = useRef(false);
  const pointerCaptureElRef = useRef<HTMLElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
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

  const clearDrag = useCallback(() => {
    dragFromRef.current = null;
    dragSourceRef.current = null;
    imageDropSlotRef.current = null;
    dropLineBeforeRef.current = null;
    committedSlotRef.current = null;
    dropCommittedRef.current = null;
    setDragFrom(null);
    setDropBefore(null);
    setImageDropSlot(null);
    setDropLineBefore(null);
    pointerDragSessionRef.current = false;
    pointerCaptureElRef.current = null;
    activePointerIdRef.current = null;
  }, []);

  const setImageSlot = useCallback((line: number, slot: number) => {
    const prev = imageDropSlotRef.current;
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

    if (from) return resolveFlexEmbedDrop(clientX, hit.line, hit.lineIndex, from);
    return { line: hit.lineIndex, cell: 0 };
  }, []);

  const commitDropAt = useCallback(
    (before: CellPos, embedName?: string) => {
      const from = dragSourceRef.current ?? dragFromRef.current;
      const curLines = linesRef.current;
      const curFiles = filesRef.current;
      const lineBefore = dropLineBeforeRef.current;

      if (from != null) {
        if (lineBefore != null) {
          applyLines(moveEmbedToLineBefore(curLines, from, lineBefore, curFiles));
        } else if (!isDropNoop(from, before)) {
          applyLines(moveEmbedAt(curLines, from, before, curFiles));
        }
      } else if (embedName && findNoteFile(curFiles, embedName)) {
        applyLines(insertEmbedAt(curLines, before, embedName, curFiles));
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
        const slot = resolveImageGridSlot(
          clientX,
          hit.lineEl,
          hit.lineIndex,
          hit.line,
          dragSourceRef.current ?? dragFromRef.current,
          committedSlotRef,
          imageDropSlotRef,
        );
        setImageSlot(hit.lineIndex, slot);
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
        setDropBefore((prev) =>
          prev && prev.line === stable.line && prev.cell === stable.cell ? prev : stable,
        );
      }
    },
    [resolveDropBefore, setImageSlot],
  );

  const performDrop = useCallback(
    (clientX: number, clientY: number, dataTransfer: DataTransfer | null) => {
      const before = dragSourceRef.current != null
        ? dropCommittedRef.current ?? resolveDropBefore(clientX, clientY)
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
    [commitDropAt, onAddFile, resolveDropBefore],
  );

  const initEmbedDragSession = useCallback(
    (pos: CellPos, lineCtx?: BodyLine, lineIndexCtx?: number, overlayPos?: { x: number; y: number }) => {
      dragSourceRef.current = pos;
      dragFromRef.current = pos;
      dropLineBeforeRef.current = null;
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

        const before = dropCommittedRef.current ?? resolveDropBefore(ev.clientX, ev.clientY);
        commitDropAt(before);
      }

      capTarget.addEventListener("lostpointercapture", onLostCapture);

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clearDrag, commitDropAt, initEmbedDragSession, resolveDropBefore, syncDragFloatPosition, updateDropTarget],
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

  return (
    <>
      <div
        ref={canvasRef}
        className={`note-body-canvas${isView ? " note-body-view note-body-view--rich" : " note-body-edit-canvas"}${isDragging ? " note-body-canvas--dragging" : ""}`}
        onDragOver={handleCanvasDragOver}
      >
        {!hasContent ? (
          <span className="note-body-empty">Заметка пустая</span>
        ) : (
          lines.map((line, li) => {
            const isImageLine = isImageEmbedRow(line, files);
            const leadSlot =
              !isImageLine && dropGapActive && dropBefore!.line === li && dropBefore!.cell === 0 ? (
                <div key={`slot-lead-${li}`} className="note-embed-drop-lead-abs" aria-hidden>
                  <DropIndicator axis="horizontal" />
                </div>
              ) : null;

            if (isImageLine) {
              return (
                <ImageGridLine
                  key={`line-${li}`}
                  line={line}
                  lineIndex={li}
                  lines={lines}
                  files={files}
                  isView={isView}
                  dragFrom={dragFrom}
                  imageDropSlot={imageDropSlot}
                  dropSlotBefore={dropLineBeforeActive && dropLineBefore === li}
                  onEmbedPointerDown={(pos, e) => beginEmbedPointerDrag(pos, e, line, li)}
                />
              );
            }

            return (
              <div
                key={`line-${li}`}
                className={`note-body-line${isEmbedLine(line) ? " note-body-line--embed" : " note-body-line--text"}`}
                data-line={li}
                onDragOver={(e) => e.preventDefault()}
              >
                {leadSlot}
                {isEmbedLine(line) ? (
                  <>
                    {line.cells.flatMap((cell, ci) => {
                      const nodes: ReactNode[] = [];
                      const showFlexSlot =
                        dropGapActive && dropBefore!.line === li && dropBefore!.cell === ci;
                      if (showFlexSlot) nodes.push(<DropIndicator key={`slot-flex-${li}-${ci}`} axis="vertical" />);
                      const lifted = dragFrom?.line === li && dragFrom.cell === ci;
                      nodes.push(
                        <NoteBodyCell
                          key={`cell-${li}-${ci}-${cell.type === "embed" ? cell.name : "t"}`}
                          cell={cell}
                          pos={{ line: li, cell: ci }}
                          files={files}
                          isView={isView}
                          isPlaceholder={false}
                          isDragLifted={lifted}
                          onTextChange={(content) =>
                            applyLines(updateTextCell(lines, { line: li, cell: ci }, content))
                          }
                          onTextEnter={(at) => applyLines(splitLineAtCaret(lines, { line: li, cell: ci }, at))}
                          onEmbedPointerDown={(pos, e) => beginEmbedPointerDrag(pos, e, line, li)}
                        />,
                      );
                      return nodes;
                    })}
                    {dropGapActive &&
                    dropBefore!.line === li &&
                    dropBefore!.cell === line.cells.length ? (
                      <DropIndicator key={`slot-flex-tail-${li}`} axis="vertical" />
                    ) : null}
                  </>
                ) : (
                  line.cells.map((cell, ci) => (
                    <NoteBodyCell
                      key={`cell-${li}-${ci}-${cell.type === "embed" ? cell.name : "t"}`}
                      cell={cell}
                      pos={{ line: li, cell: ci }}
                      files={files}
                      isView={isView}
                      isPlaceholder={false}
                      isDragLifted={dragFrom?.line === li && dragFrom.cell === ci}
                      onTextChange={(content) =>
                        applyLines(updateTextCell(lines, { line: li, cell: ci }, content))
                      }
                      onTextEnter={(at) => applyLines(splitLineAtCaret(lines, { line: li, cell: ci }, at))}
                    />
                  ))
                )}
              </div>
            );
          })
        )}
        {dropGapActive && dropBefore!.line === lines.length && dropBefore!.cell === 0 ? (
          <div
            key="note-drop-tail"
            className="note-body-line note-body-line--drop-tail"
            data-line={lines.length}
            data-drop-tail="1"
            onDragOver={(e) => e.preventDefault()}
          >
            <DropIndicator axis="horizontal" />
          </div>
        ) : null}
      </div>
      {typeof document !== "undefined" &&
        isDragging &&
        draggedEmbedCell &&
        createPortal(
          <div
            ref={dragFloatMountRef}
            className="note-embed-drag-float"
            style={{
              width: DRAG_CARD_W,
              height: DRAG_CARD_H,
            }}
          >
            <EmbedDragPreview cell={draggedEmbedCell} files={files} />
          </div>,
          document.body,
        )}
    </>
  );
}

function ImageGridLine({
  line,
  lineIndex,
  lines,
  files,
  isView,
  dragFrom,
  imageDropSlot,
  dropSlotBefore,
  onEmbedPointerDown,
}: {
  line: BodyLine;
  lineIndex: number;
  lines: BodyLine[];
  files: NoteFile[];
  isView: boolean;
  dragFrom: CellPos | null;
  imageDropSlot: ImageDropSlot | null;
  dropSlotBefore: boolean;
  onEmbedPointerDown?: (pos: CellPos, e: React.PointerEvent) => void;
}) {
  const insertSlot = imageDropSlot?.line === lineIndex ? imageDropSlot.slot : null;

  const incoming =
    dragFrom != null && dragFrom.line !== lineIndex && lines[dragFrom.line]?.cells[dragFrom.cell]?.type === "embed"
      ? lines[dragFrom.line]!.cells[dragFrom.cell]!
      : null;

  const slots = buildImageGridSlotLayout(
    line,
    lineIndex,
    dragFrom,
    insertSlot,
    files,
    incoming,
    incoming ? dragFrom : null,
  );

  return (
    <div
      className="note-body-line note-body-line--embed note-embed-image-grid"
      data-line={lineIndex}
      onDragOver={(e) => e.preventDefault()}
    >
      {dropSlotBefore ? (
        <div className="note-embed-grid-drop-lead-abs" aria-hidden>
          <DropIndicator axis="horizontal" />
        </div>
      ) : null}
      {slots.map((item, slotIdx) =>
        item ? (
          <NoteBodyCell
            key={`ig-${lineIndex}-${slotIdx}`}
            cell={item.cell}
            pos={item.pos}
            files={files}
            isView={isView}
            isPlaceholder={item.isPlaceholder}
            onTextChange={() => {}}
            onTextEnter={() => {}}
            onEmbedPointerDown={onEmbedPointerDown}
            isDragLifted={
              !item.isPlaceholder &&
              dragFrom != null &&
              dragFrom.line === lineIndex &&
              dragFrom.cell === item.pos.cell
            }
          />
        ) : (
          <div key={`empty-${lineIndex}-${slotIdx}`} className="note-embed-image-slot note-embed-image-slot--empty" aria-hidden />
        ),
      )}
    </div>
  );
}

function DropIndicator({ axis }: { axis: "horizontal" | "vertical" }) {
  return (
    <div
      className={`note-embed-drop-indicator note-embed-drop-indicator--${axis}`}
      aria-hidden
    />
  );
}

function EmbedDragPreview({ cell, files }: { cell: LineCell; files: NoteFile[] }) {
  if (cell.type !== "embed") return null;
  const file = findNoteFile(files, cell.name);
  const isImage = isImageEmbed(file);
  const token = embedToken(cell.name);
  return (
    <div className="note-embed-drag-float-inner">
      {isImage && file?.url ? (
        <img src={file.url} alt="" className="note-embed-drag-float-img" draggable={false} />
      ) : (
        <code className="note-embed-drag-float-code">{token}</code>
      )}
    </div>
  );
}

function stabilizeFlexEmbedDropCommitted(
  prev: CellPos | null,
  raw: CellPos,
  clientX: number,
  lineIndex: number,
): CellPos {
  if (!prev || prev.line !== raw.line || prev.line !== lineIndex || prev.cell === raw.cell) return raw;
  if (Math.abs(prev.cell - raw.cell) !== 1) return raw;

  const lineEl = document.querySelector<HTMLElement>(`.note-body-line[data-line="${lineIndex}"]`);
  if (!lineEl) return raw;

  const embeds = [...lineEl.children].filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.classList.contains("note-body-cell--embed"),
  );

  const rectFor = (cellIdx: number) =>
    embeds.find((el) => Number(el.dataset.cell) === cellIdx)?.getBoundingClientRect();

  const lo = Math.min(prev.cell, raw.cell);
  const hi = Math.max(prev.cell, raw.cell);
  const leftEl = rectFor(lo);
  const rightEl = rectFor(hi);
  if (!leftEl || !rightEl) return raw;

  const mid = (leftEl.right + rightEl.left) / 2;
  if (Math.abs(clientX - mid) < FLEX_DROP_X_HYST_PX) return prev;
  return raw;
}

/** Пока курсор в полосе у границы «до/после» текстовой строки — держим прошлую цель, меньше дрожания. */
function stabilizeDropBeforeCommitted(
  prev: CellPos | null,
  raw: CellPos,
  clientX: number,
  clientY: number,
  lines: BodyLine[],
  files: NoteFile[],
): CellPos {
  const hit = hitTestLine(clientX, clientY, lines, files);
  if (!hit) return raw;

  if (isTextLine(hit.line)) {
    const { top, height: h } = textLineCellMetrics(hit.lineEl);
    const boundaryY = top + h * TEXT_DROP_BOUNDARY_FRAC;
    const band = textLineDropHysteresisPx(h);
    const i = hit.lineIndex;

    if (prev && prev.cell === 0) {
      const prevLine = prev.line;
      if (prevLine === i || prevLine === i + 1) {
        if (prevLine === i) {
          if (clientY <= boundaryY + band) return prev;
          return raw;
        }
        if (prevLine === i + 1) {
          if (clientY >= boundaryY - band) return prev;
          return raw;
        }
      }
    }
    return raw;
  }

  if (!hit.isImageGrid && isEmbedLine(hit.line)) {
    return stabilizeFlexEmbedDropCommitted(prev, raw, clientX, hit.lineIndex);
  }

  return raw;
}

function hitTestLine(
  clientX: number,
  clientY: number,
  lines: BodyLine[],
  files: NoteFile[],
): { line: BodyLine; lineIndex: number; lineEl: HTMLElement; isImageGrid: boolean } | null {
  const lineEls = document.querySelectorAll<HTMLElement>(".note-body-line");
  for (let li = 0; li < lineEls.length; li++) {
    const lineEl = lineEls[li]!;
    const r = lineEl.getBoundingClientRect();
    if (clientY >= r.top && clientY <= r.bottom) {
      if (lineEl.dataset.dropTail === "1") {
        return {
          line: { cells: [{ type: "text", content: "" }] },
          lineIndex: lines.length,
          lineEl,
          isImageGrid: false,
        };
      }
      const line = lines[li];
      if (!line) return null;
      return { line, lineIndex: li, lineEl, isImageGrid: isImageEmbedRow(line, files) };
    }
    if (clientY < r.top) break;
  }
  return null;
}

function imageGridMetrics(lineEl: HTMLElement) {
  const r = lineEl.getBoundingClientRect();
  const gap = EMBED_IMAGE_SLOT_GAP;
  const width = Math.max(0, r.width);
  const cellW = width > 0 ? (width - 2 * gap) / 3 : 0;
  return { left: r.left, width, cellW, gap };
}

/** Гистерезис слота: только от ширины сетки, не от rect детей (они двигаются вместе с плейсхолдером и создавали обратную связь). */
function imageGridSlotHysteresisPx(cellW: number): number {
  return Math.max(28, Math.min(56, cellW * 0.14));
}

function rawImageGridSlot(clientX: number, lineEl: HTMLElement): number {
  const { left, width, cellW, gap } = imageGridMetrics(lineEl);
  if (width <= 0 || cellW <= 0) return 0;
  const x = clientX - left;
  if (x < 0) return 0;
  if (x >= width) return MAX_IMAGES_PER_EMBED_ROW;
  for (let i = 0; i < 3; i++) {
    const colStart = i * (cellW + gap);
    const colEnd = colStart + cellW;
    if (x < colEnd) return i;
    if (i < 2) {
      const gapEnd = colEnd + gap;
      if (x < gapEnd) {
        return x < colEnd + gap * 0.5 ? i : i + 1;
      }
    }
  }
  return MAX_IMAGES_PER_EMBED_ROW;
}

function stabilizeImageGridSlot(
  clientX: number,
  lineEl: HTMLElement,
  rawSlot: number,
  committed: number | null,
): number {
  const { left, width, cellW, gap } = imageGridMetrics(lineEl);
  if (width <= 0 || cellW <= 0 || committed == null) return rawSlot;
  const h = imageGridSlotHysteresisPx(cellW);
  const colLeft = (i: number) => left + i * (cellW + gap);
  const colRight = (i: number) => colLeft(i) + cellW;

  let slot = committed;
  if (rawSlot > slot && slot < MAX_IMAGES_PER_EMBED_ROW) {
    if (slot < 2) {
      const nextLeft = colLeft(slot + 1);
      if (clientX >= nextLeft - h) slot += 1;
    } else if (slot === 2) {
      if (clientX >= colRight(2) - h) slot += 1;
    }
  } else if (rawSlot < slot && slot > 0) {
    if (slot === MAX_IMAGES_PER_EMBED_ROW) {
      if (clientX <= colRight(2) - h) slot -= 1;
    } else if (clientX <= colLeft(slot) + h) {
      slot -= 1;
    }
  }
  return Math.max(0, Math.min(MAX_IMAGES_PER_EMBED_ROW, slot));
}

function resolveImageGridSlot(
  clientX: number,
  lineEl: HTMLElement,
  lineIndex: number,
  line: BodyLine,
  dragSource: CellPos | null,
  committedRef: MutableRefObject<number | null>,
  slotRef: React.MutableRefObject<ImageDropSlot | null>,
): number {
  const raw = rawImageGridSlot(clientX, lineEl);
  const committed = slotRef.current?.line === lineIndex ? committedRef.current : null;
  const slot = stabilizeImageGridSlot(clientX, lineEl, raw, committed);
  const othersCount = Math.max(0, line.cells.length - (dragSource?.line === lineIndex ? 1 : 0));
  const normalized = Math.min(slot, othersCount);
  committedRef.current = normalized;
  return normalized;
}

function resolveFlexEmbedDrop(clientX: number, line: BodyLine, lineIndex: number, dragFrom: CellPos): CellPos {
  const lineEl = document.querySelector<HTMLElement>(`.note-body-line[data-line="${lineIndex}"]`);
  if (!lineEl) return { line: lineIndex, cell: 0 };

  const nodes = [...lineEl.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains("note-body-cell--embed"),
  );

  if (!nodes.length) return { line: lineIndex, cell: 0 };

  const rects = nodes.map((el) => el.getBoundingClientRect());
  if (clientX < rects[0]!.left) return { line: lineIndex, cell: Number(nodes[0]!.dataset.cell) || 0 };

  for (let i = 0; i < rects.length - 1; i++) {
    const mid = (rects[i]!.right + rects[i + 1]!.left) / 2;
    if (clientX < mid) return { line: lineIndex, cell: Number(nodes[i + 1]!.dataset.cell) || 0 };
  }

  const last = Number(nodes[nodes.length - 1]!.dataset.cell);
  return { line: lineIndex, cell: Number.isFinite(last) ? last + 1 : line.cells.length };
}

function NoteBodyCell({
  cell,
  pos,
  files,
  isView,
  isPlaceholder = false,
  isDragLifted = false,
  onTextChange,
  onTextEnter,
  onEmbedPointerDown,
}: {
  cell: LineCell;
  pos: CellPos;
  files: NoteFile[];
  isView: boolean;
  isPlaceholder?: boolean;
  isDragLifted?: boolean;
  onTextChange: (content: string) => void;
  onTextEnter: (caret: number) => void;
  onEmbedPointerDown?: (pos: CellPos, e: React.PointerEvent) => void;
}) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isView && cell.type === "text" && lineRef.current) autoGrow(lineRef.current);
  }, [cell, isView]);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
  };

  if (cell.type === "text") {
    if (isView && !cell.content) return null;
    return (
      <span ref={cellRef} className="note-body-cell note-body-cell--text" data-line={pos.line} data-cell={pos.cell} {...dragHandlers}>
        {isView ? (
          <span className="note-body-text">{cell.content || "\u00a0"}</span>
        ) : (
          <textarea
            ref={lineRef}
            className="note-body-line-edit"
            value={cell.content}
            rows={1}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onTextEnter(e.currentTarget.selectionStart ?? cell.content.length);
              }
            }}
          />
        )}
      </span>
    );
  }

  const file = findNoteFile(files, cell.name);
  const isImage = isImageEmbed(file);
  const token = embedToken(cell.name);
  const blockLinkNativeDrag = (e: React.DragEvent) => e.preventDefault();
  const canPointerDrag = !isPlaceholder && onEmbedPointerDown != null;

  return (
    <span
      ref={cellRef}
      className={`note-body-cell note-body-cell--embed note-body-cell--embed-draggable${isPlaceholder ? " note-body-cell--drop-placeholder" : ""}${isDragLifted ? " note-body-cell--drag-lifted" : ""}`}
      data-line={pos.line}
      data-cell={pos.cell}
      data-embed-name={cell.name}
      style={canPointerDrag ? ({ touchAction: "none" } as const) : undefined}
      onPointerDown={
        canPointerDrag
          ? (e) => {
              onEmbedPointerDown!(pos, e);
            }
          : undefined
      }
      {...dragHandlers}
    >
      {isView && isImage && file?.url ? (
        <img className="note-inline-image" src={file.url} alt={cell.name} draggable={false} />
      ) : (
        <span className="note-embed-chip">
          {isView ? (
            <a
              href={file?.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onDragStart={blockLinkNativeDrag}
              onClick={(e) => !file?.url && e.preventDefault()}
            >
              {token}
            </a>
          ) : (
            <code className="note-embed-md" draggable={false}>
              {token}
            </code>
          )}
        </span>
      )}
    </span>
  );
}

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
