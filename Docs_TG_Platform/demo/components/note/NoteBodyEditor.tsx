"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NoteFile } from "@/lib/types";
import {
  embedToken,
  findNoteFile,
  insertEmbedAt,
  isDropNoop,
  isEmbedLine,
  isImageEmbed,
  isTextLine,
  moveEmbedAt,
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
const DEFAULT_GAP = 28;

type Props = {
  body: string;
  files: NoteFile[];
  isView: boolean;
  onBodyChange: (body: string) => void;
  onAddFile: (file: File) => NoteFile;
};

export default function NoteBodyEditor({ body, files, isView, onBodyChange, onAddFile }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragFromRef = useRef<CellPos | null>(null);
  const lines = useMemo(() => segmentsToLines(parseNoteBody(body)), [body]);

  const [dragFrom, setDragFrom] = useState<CellPos | null>(null);
  const [dropBefore, setDropBefore] = useState<CellPos | null>(null);
  const [externalDrag, setExternalDrag] = useState(false);

  const isDragging = dragFrom != null || externalDrag;

  const applyLines = useCallback(
    (next: BodyLine[]) => {
      onBodyChange(linesToBody(next));
    },
    [onBodyChange],
  );

  const resetDrag = useCallback(() => {
    dragFromRef.current = null;
    setDragFrom(null);
    setDropBefore(null);
    setExternalDrag(false);
  }, []);

  const setDropTarget = useCallback((pos: CellPos | null) => {
    setDropBefore((prev) => {
      if (prev?.line === pos?.line && prev?.cell === pos?.cell) return prev;
      return pos;
    });
  }, []);

  const commitDropAt = useCallback(
    (before: CellPos, embedName?: string) => {
      const from = dragFromRef.current;
      if (from != null) {
        if (!isDropNoop(from, before)) applyLines(moveEmbedAt(lines, from, before, files));
      } else if (embedName && findNoteFile(files, embedName)) {
        applyLines(insertEmbedAt(lines, before, embedName, files));
      }
      resetDrag();
    },
    [applyLines, files, lines, resetDrag],
  );

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragFromRef.current != null ? "move" : "copy";
    if (dragFromRef.current == null && e.dataTransfer.types.length > 0) setExternalDrag(true);
    const target = resolveDropTarget(e.clientX, e.clientY, lines, dragFromRef.current);
    setDropTarget(target);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const before = resolveDropTarget(e.clientX, e.clientY, lines, dragFromRef.current);
    commitDropAt(before, e.dataTransfer.getData(EMBED_MIME) || undefined);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const entry = onAddFile(file);
    const before = dropBefore ?? { line: lines.length, cell: 0 };
    applyLines(insertEmbedAt(lines, before, entry.name, files));
    resetDrag();
  };

  const hasContent = lines.some((l) => l.cells.some((c) => (c.type === "text" ? c.content.trim() : true)));

  return (
    <div
      ref={canvasRef}
      className={`note-body-canvas${isView ? " note-body-view note-body-view--rich" : " note-body-edit-canvas"}`}
      onDragOver={handleCanvasDragOver}
      onDrop={(e) => {
        if (e.dataTransfer.files?.length) {
          handleFileDrop(e);
          return;
        }
        handleCanvasDrop(e);
      }}
      onDragLeave={(e) => {
        if (!canvasRef.current?.contains(e.relatedTarget as Node)) resetDrag();
      }}
    >
      {!hasContent && !isDragging ? (
        <span className="note-body-empty">Заметка пустая</span>
      ) : (
        lines.map((line, li) => {
          const dropBeforeLine = isDragging && dropBefore?.line === li && dropBefore.cell === 0;
          const dropAfterLine =
            isDragging && isEmbedLine(line) && dropBefore?.line === li && dropBefore.cell === line.cells.length;
          return (
            <div
              key={`line-${li}`}
              className={`note-body-line${isEmbedLine(line) ? " note-body-line--embed" : " note-body-line--text"}${dropBeforeLine ? " is-drop-before-line" : ""}${dropAfterLine ? " is-drop-after-line" : ""}`}
              data-line={li}
            >
              {line.cells.map((cell, ci) => (
                <NoteBodyCell
                  key={`cell-${li}-${ci}-${cell.type === "embed" ? cell.name : "t"}`}
                  cell={cell}
                  pos={{ line: li, cell: ci }}
                  files={files}
                  isView={isView}
                  isDragging={dragFrom?.line === li && dragFrom.cell === ci}
                  isDropBefore={
                    isDragging && isEmbedLine(line) && dropBefore?.line === li && dropBefore.cell === ci
                  }
                  onTextChange={(content) => applyLines(updateTextCell(lines, { line: li, cell: ci }, content))}
                  onTextEnter={(at) => applyLines(splitLineAtCaret(lines, { line: li, cell: ci }, at))}
                  onDragEmbedStart={(pos) => {
                    dragFromRef.current = pos;
                    setDragFrom(pos);
                  }}
                  onDragEmbedEnd={resetDrag}
                  onDragOverCell={(e) => {
                    const target = isTextLine(line)
                      ? resolveDropTarget(e.clientX, e.clientY, lines, dragFromRef.current)
                      : { line: li, cell: ci };
                    setDropTarget(target);
                  }}
                  onDropOnCell={(e, embedName) => {
                    const before = isTextLine(line)
                      ? resolveDropTarget(e.clientX, e.clientY, lines, dragFromRef.current)
                      : { line: li, cell: ci };
                    commitDropAt(before, embedName);
                  }}
                />
              ))}
            </div>
          );
        })
      )}
      {dropBefore?.line === lines.length && dropBefore.cell === 0 && isDragging ? (
        <div className="note-embed-gap--trailing" aria-hidden />
      ) : null}
    </div>
  );
}

function resolveDropTarget(clientX: number, clientY: number, lines: BodyLine[], dragFrom: CellPos | null): CellPos {
  const lineEls = document.querySelectorAll<HTMLElement>(".note-body-line");
  if (!lineEls.length) return { line: 0, cell: 0 };

  for (let li = 0; li < lineEls.length; li++) {
    const lineRect = lineEls[li].getBoundingClientRect();

    if (clientY < lineRect.top) {
      return { line: li, cell: 0 };
    }

    if (clientY <= lineRect.bottom) {
      const line = lines[li];
      if (!line) return { line: li, cell: 0 };

      if (isTextLine(line)) {
        const midY = lineRect.top + lineRect.height / 2;
        if (clientY < midY) return { line: li, cell: 0 };
        return { line: li + 1, cell: 0 };
      }

      const cellEls = lineEls[li].querySelectorAll<HTMLElement>(".note-body-cell");
      if (!cellEls.length) return { line: li, cell: 0 };

      for (let ci = 0; ci < cellEls.length; ci++) {
        const cr = cellEls[ci].getBoundingClientRect();
        const midX = cr.left + cr.width / 2;
        if (clientX < midX) {
          const pos = { line: li, cell: ci };
          if (dragFrom && dragFrom.line === li && dragFrom.cell === ci) return { line: li, cell: ci + 1 };
          return pos;
        }
      }
      return { line: li, cell: cellEls.length };
    }
  }

  return { line: lines.length, cell: 0 };
}

function NoteBodyCell({
  cell,
  pos,
  files,
  isView,
  isDragging,
  isDropBefore,
  onTextChange,
  onTextEnter,
  onDragEmbedStart,
  onDragEmbedEnd,
  onDragOverCell,
  onDropOnCell,
}: {
  cell: LineCell;
  pos: CellPos;
  files: NoteFile[];
  isView: boolean;
  isDragging: boolean;
  isDropBefore?: boolean;
  onTextChange: (content: string) => void;
  onTextEnter: (caret: number) => void;
  onDragEmbedStart: (pos: CellPos) => void;
  onDragEmbedEnd: () => void;
  onDragOverCell: (e: React.DragEvent) => void;
  onDropOnCell: (e: React.DragEvent, embedName?: string) => void;
}) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isView && cell.type === "text" && lineRef.current) autoGrow(lineRef.current);
  }, [cell, isView]);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragOverCell(e);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDropOnCell(e, e.dataTransfer.getData(EMBED_MIME) || undefined);
    },
  };

  if (cell.type === "text") {
    if (isView && !cell.content) return null;
    return (
      <span
        ref={cellRef}
        className={`note-body-cell note-body-cell--text${isDragging ? " is-dragging" : ""}${isDropBefore ? " is-drop-before" : ""}`}
        data-line={pos.line}
        data-cell={pos.cell}
        {...dragHandlers}
      >
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
  const blockChildDrag = (e: React.DragEvent) => e.preventDefault();

  return (
    <span
      ref={cellRef}
      className={`note-body-cell note-body-cell--embed${isDragging ? " is-dragging" : ""}${isDropBefore ? " is-drop-before" : ""}`}
      data-line={pos.line}
      data-cell={pos.cell}
      draggable
      onDragStart={(e) => {
        const h = cellRef.current?.getBoundingClientRect().height ?? DEFAULT_GAP;
        e.dataTransfer.setData(EMBED_MIME, cell.name);
        e.dataTransfer.setData("text/plain", token);
        e.dataTransfer.effectAllowed = "move";
        if (cellRef.current) e.dataTransfer.setDragImage(cellRef.current, 8, 8);
        onDragEmbedStart(pos);
      }}
      onDragEnd={onDragEmbedEnd}
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
              onDragStart={blockChildDrag}
              onClick={(e) => !file?.url && e.preventDefault()}
            >
              {token}
            </a>
          ) : (
            <code className="note-embed-md" draggable={false} onDragStart={blockChildDrag}>
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
