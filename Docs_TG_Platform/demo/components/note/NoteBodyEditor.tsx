"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { NoteFile } from "@/lib/types";
import {
  buildImageGridSlotLayout,
  dropBeforeToImageSlot,
  EMBED_IMAGE_SLOT_STEP,
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
const IMAGE_SLOT_HYSTERESIS = 32;

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
  const committedSlotRef = useRef<number | null>(null);

  const lines = useMemo(() => segmentsToLines(parseNoteBody(body)), [body]);
  linesRef.current = lines;
  filesRef.current = files;

  const [dragFrom, setDragFrom] = useState<CellPos | null>(null);
  const [imageDropSlot, setImageDropSlot] = useState<ImageDropSlot | null>(null);

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
    committedSlotRef.current = null;
    setDragFrom(null);
    setImageDropSlot(null);
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

    if (hit && slotState && slotState.line === hit.lineIndex && isImageEmbedRow(hit.line, curFiles)) {
      return imageGridSlotToDropBefore(hit.line, hit.lineIndex, slotState.slot, from);
    }

    if (!hit) return { line: curLines.length, cell: 0 };

    if (isTextLine(hit.line)) {
      const r = hit.lineEl.getBoundingClientRect();
      if (clientY < r.top + r.height * 0.25) return { line: hit.lineIndex, cell: 0 };
      return { line: hit.lineIndex + 1, cell: 0 };
    }

    if (hit.isImageGrid && from) {
      const slot = resolveImageGridSlot(
        clientX,
        hit.lineEl.getBoundingClientRect(),
        hit.lineIndex,
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
      const from = dragSourceRef.current;
      const curLines = linesRef.current;
      const curFiles = filesRef.current;

      if (from != null) {
        if (!isDropNoop(from, before)) {
          applyLines(moveEmbedAt(curLines, from, before, curFiles));
        }
      } else if (embedName && findNoteFile(curFiles, embedName)) {
        applyLines(insertEmbedAt(curLines, before, embedName, curFiles));
      }
      clearDrag();
    },
    [applyLines, clearDrag],
  );

  const updateDropTarget = useCallback((clientX: number, clientY: number) => {
    const hit = hitTestLine(clientX, clientY, linesRef.current, filesRef.current);
    if (!hit?.isImageGrid) return;

    const slot = resolveImageGridSlot(
      clientX,
      hit.lineEl.getBoundingClientRect(),
      hit.lineIndex,
      committedSlotRef,
      imageDropSlotRef,
    );
    setImageSlot(hit.lineIndex, slot);
  }, [setImageSlot]);

  const performDrop = useCallback(
    (clientX: number, clientY: number, dataTransfer: DataTransfer | null) => {
      const before = resolveDropBefore(clientX, clientY);

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
  }, [performDrop, updateDropTarget]);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragFromRef.current != null ? "move" : "copy";
    updateDropTarget(e.clientX, e.clientY);
  };

  const endEmbedDrag = useCallback(() => {
    requestAnimationFrame(() => {
      if (dragSourceRef.current != null) clearDrag();
    });
  }, [clearDrag]);

  const startEmbedDrag = useCallback((pos: CellPos, line: BodyLine, lineIndex: number) => {
    dragSourceRef.current = pos;
    dragFromRef.current = pos;
    committedSlotRef.current = null;
    const startSlot = dropBeforeToImageSlot(line, lineIndex, { line: lineIndex, cell: pos.cell }, null);
    imageDropSlotRef.current = { line: lineIndex, slot: startSlot };
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (dragFromRef.current?.line === pos.line && dragFromRef.current?.cell === pos.cell) {
          setDragFrom(pos);
          setImageDropSlot({ line: lineIndex, slot: startSlot });
        }
      });
    });
  }, []);

  const hasContent = lines.some((l) => l.cells.some((c) => (c.type === "text" ? c.content.trim() : true)));

  return (
    <div
      ref={canvasRef}
      className={`note-body-canvas${isView ? " note-body-view note-body-view--rich" : " note-body-edit-canvas"}${isDragging ? " note-body-canvas--dragging" : ""}`}
      onDragOver={handleCanvasDragOver}
    >
      {!hasContent ? (
        <span className="note-body-empty">Заметка пустая</span>
      ) : (
        lines.map((line, li) => {
          if (isImageEmbedRow(line, files)) {
            return (
              <ImageGridLine
                key={`line-${li}`}
                line={line}
                lineIndex={li}
                files={files}
                isView={isView}
                dragFrom={dragFrom}
                imageDropSlot={imageDropSlot}
                onDragEmbedStart={(pos) => startEmbedDrag(pos, line, li)}
                onDragEmbedEnd={endEmbedDrag}
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
              {line.cells.map((cell, ci) => {
                if (dragFrom?.line === li && dragFrom.cell === ci) return null;
                return (
                  <NoteBodyCell
                    key={`cell-${li}-${ci}-${cell.type === "embed" ? cell.name : "t"}`}
                    cell={cell}
                    pos={{ line: li, cell: ci }}
                    files={files}
                    isView={isView}
                    isPlaceholder={false}
                    onTextChange={(content) => applyLines(updateTextCell(lines, { line: li, cell: ci }, content))}
                    onTextEnter={(at) => applyLines(splitLineAtCaret(lines, { line: li, cell: ci }, at))}
                    onDragEmbedStart={(pos) => {
                      dragSourceRef.current = pos;
                      dragFromRef.current = pos;
                      imageDropSlotRef.current = null;
                      committedSlotRef.current = null;
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          if (dragFromRef.current?.line === pos.line && dragFromRef.current?.cell === pos.cell) {
                            setDragFrom(pos);
                            setImageDropSlot(null);
                          }
                        });
                      });
                    }}
                    onDragEmbedEnd={endEmbedDrag}
                  />
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

function ImageGridLine({
  line,
  lineIndex,
  files,
  isView,
  dragFrom,
  imageDropSlot,
  onDragEmbedStart,
  onDragEmbedEnd,
}: {
  line: BodyLine;
  lineIndex: number;
  files: NoteFile[];
  isView: boolean;
  dragFrom: CellPos | null;
  imageDropSlot: ImageDropSlot | null;
  onDragEmbedStart: (pos: CellPos) => void;
  onDragEmbedEnd: () => void;
}) {
  const insertSlot =
    dragFrom?.line === lineIndex
      ? imageDropSlot?.line === lineIndex
        ? imageDropSlot.slot
        : dragFrom.cell
      : null;

  const slots = buildImageGridSlotLayout(line, lineIndex, dragFrom, insertSlot, files);

  return (
    <div
      className="note-body-line note-body-line--embed note-embed-image-grid"
      data-line={lineIndex}
      onDragOver={(e) => e.preventDefault()}
    >
      {slots.map((item, slotIdx) =>
        item ? (
          <NoteBodyCell
            key={`${lineIndex}-${item.cell.type === "embed" ? item.cell.name : "t"}`}
            cell={item.cell}
            pos={item.pos}
            files={files}
            isView={isView}
            isPlaceholder={item.isPlaceholder}
            onTextChange={() => {}}
            onTextEnter={() => {}}
            onDragEmbedStart={onDragEmbedStart}
            onDragEmbedEnd={onDragEmbedEnd}
          />
        ) : (
          <div key={`empty-${lineIndex}-${slotIdx}`} className="note-embed-image-slot note-embed-image-slot--empty" aria-hidden />
        ),
      )}
    </div>
  );
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
      const line = lines[li];
      if (!line) return null;
      return { line, lineIndex: li, lineEl, isImageGrid: isImageEmbedRow(line, files) };
    }
    if (clientY < r.top) break;
  }
  return null;
}

function rawImageGridSlot(clientX: number, lineRect: DOMRect): number {
  const x = clientX - lineRect.left;
  let slot = Math.floor(x / EMBED_IMAGE_SLOT_STEP);
  if (slot < 0) slot = 0;
  if (slot > MAX_IMAGES_PER_EMBED_ROW) slot = MAX_IMAGES_PER_EMBED_ROW;
  return slot;
}

function stabilizeImageGridSlot(
  clientX: number,
  lineRect: DOMRect,
  rawSlot: number,
  committed: number | null,
): number {
  if (committed == null) return rawSlot;
  let slot = committed;
  if (rawSlot > slot) {
    const edge = lineRect.left + (slot + 1) * EMBED_IMAGE_SLOT_STEP - IMAGE_SLOT_HYSTERESIS;
    if (clientX >= edge) slot += 1;
  } else if (rawSlot < slot) {
    const edge = lineRect.left + slot * EMBED_IMAGE_SLOT_STEP + IMAGE_SLOT_HYSTERESIS;
    if (clientX <= edge) slot -= 1;
  }
  return Math.max(0, Math.min(MAX_IMAGES_PER_EMBED_ROW, slot));
}

function resolveImageGridSlot(
  clientX: number,
  lineRect: DOMRect,
  lineIndex: number,
  committedRef: MutableRefObject<number | null>,
  slotRef: React.MutableRefObject<ImageDropSlot | null>,
): number {
  const raw = rawImageGridSlot(clientX, lineRect);
  const committed = slotRef.current?.line === lineIndex ? committedRef.current : null;
  const slot = stabilizeImageGridSlot(clientX, lineRect, raw, committed);
  committedRef.current = slot;
  return slot;
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
  onTextChange,
  onTextEnter,
  onDragEmbedStart,
  onDragEmbedEnd,
}: {
  cell: LineCell;
  pos: CellPos;
  files: NoteFile[];
  isView: boolean;
  isPlaceholder?: boolean;
  onTextChange: (content: string) => void;
  onTextEnter: (caret: number) => void;
  onDragEmbedStart: (pos: CellPos) => void;
  onDragEmbedEnd: () => void;
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

  return (
    <span
      ref={cellRef}
      className={`note-body-cell note-body-cell--embed note-body-cell--embed-draggable${isPlaceholder ? " note-body-cell--drop-placeholder" : ""}`}
      data-line={pos.line}
      data-cell={pos.cell}
      data-embed-name={cell.name}
      draggable={!isPlaceholder}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData(EMBED_MIME, cell.name);
        e.dataTransfer.setData("text/plain", token);
        e.dataTransfer.effectAllowed = "move";
        if (cellRef.current) {
          const ghost = cellRef.current.cloneNode(true) as HTMLElement;
          ghost.style.position = "fixed";
          ghost.style.left = "-9999px";
          ghost.style.pointerEvents = "none";
          document.body.appendChild(ghost);
          try {
            e.dataTransfer.setDragImage(ghost, 8, 8);
          } finally {
            requestAnimationFrame(() => ghost.remove());
          }
        }
        onDragEmbedStart(pos);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEmbedEnd();
      }}
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
