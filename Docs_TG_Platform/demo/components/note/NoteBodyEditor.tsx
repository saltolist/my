"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NoteFile } from "@/lib/types";
import {
  embedToken,
  findNoteFile,
  insertEmbedAtRow,
  isImageEmbed,
  moveEmbedAtRow,
  parseNoteBody,
  rowsToBody,
  segmentsToRows,
  splitTextRow,
  updateTextRow,
  type BodyRow,
} from "@/lib/noteEmbeds";

const EMBED_MIME = "application/x-note-embed";
const DEFAULT_GAP = 36;

type Props = {
  body: string;
  files: NoteFile[];
  isView: boolean;
  onBodyChange: (body: string) => void;
  onAddFile: (file: File) => NoteFile;
};

export default function NoteBodyEditor({ body, files, isView, onBodyChange, onAddFile }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragFromRowRef = useRef<number | null>(null);
  const rows = useMemo(() => segmentsToRows(parseNoteBody(body)), [body]);

  const [dragFromRow, setDragFromRow] = useState<number | null>(null);
  const [dropBeforeRow, setDropBeforeRow] = useState<number | null>(null);
  const [gapHeight, setGapHeight] = useState(DEFAULT_GAP);
  const [externalDrag, setExternalDrag] = useState(false);

  const isDragging = dragFromRow != null || externalDrag;

  const applyRows = useCallback(
    (next: BodyRow[]) => {
      onBodyChange(rowsToBody(next));
    },
    [onBodyChange],
  );

  const resetDrag = useCallback(() => {
    dragFromRowRef.current = null;
    setDragFromRow(null);
    setDropBeforeRow(null);
    setExternalDrag(false);
  }, []);

  const setDropBefore = useCallback((row: number | null, height?: number) => {
    setDropBeforeRow(row);
    if (height != null && height > 0) setGapHeight(height);
  }, []);

  const commitDropAt = useCallback(
    (beforeRow: number, embedName?: string) => {
      const fromRow = dragFromRowRef.current;
      if (fromRow != null) {
        if (fromRow !== beforeRow && fromRow + 1 !== beforeRow) {
          applyRows(moveEmbedAtRow(rows, fromRow, beforeRow));
        }
      } else if (embedName && findNoteFile(files, embedName)) {
        applyRows(insertEmbedAtRow(rows, beforeRow, embedName));
      }
      resetDrag();
    },
    [applyRows, files, resetDrag, rows],
  );

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragFromRowRef.current != null ? "move" : "copy";
    if (dragFromRowRef.current == null && e.dataTransfer.types.length > 0) setExternalDrag(true);
    resolveDropFromPointer(e.clientY, rows, dragFromRowRef.current, setDropBefore);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const before = resolveDropRow(e.clientY, rows, dragFromRowRef.current);
    commitDropAt(before, e.dataTransfer.getData(EMBED_MIME) || undefined);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const entry = onAddFile(file);
    const before = dropBeforeRow ?? rows.length;
    applyRows(insertEmbedAtRow(rows, before, entry.name));
    resetDrag();
  };

  const hasContent = rows.some((r) => (r.type === "text" ? r.content.trim() : true));

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
        rows.map((row, i) => (
          <Fragment key={`row-${i}-${row.type === "embed" ? row.name : "t"}`}>
            {dropBeforeRow === i && isDragging ? <div className="note-embed-gap" style={{ minHeight: gapHeight }} /> : null}
            <NoteBodyRow
              row={row}
              rowIndex={i}
              files={files}
              isView={isView}
              isDragging={dragFromRow === i}
              onTextChange={(content) => applyRows(updateTextRow(rows, i, content))}
              onTextEnter={(at) => applyRows(splitTextRow(rows, i, at))}
              onDragEmbedStart={(row, height) => {
                dragFromRowRef.current = row;
                setDragFromRow(row);
                setGapHeight(height);
              }}
              onDragEmbedEnd={resetDrag}
              onDragOverRow={(height) => setDropBefore(i, height)}
              onDropOnRow={(embedName) => commitDropAt(i, embedName)}
            />
          </Fragment>
        ))
      )}
      {dropBeforeRow === rows.length && isDragging ? (
        <div className="note-embed-gap" style={{ minHeight: gapHeight }} />
      ) : null}
    </div>
  );
}

function resolveDropRow(clientY: number, rows: BodyRow[], dragFromRow: number | null): number {
  const els = document.querySelectorAll<HTMLElement>(".note-body-row");
  if (!els.length) return rows.length;
  for (let i = 0; i < els.length; i++) {
    const rect = els[i].getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (clientY < mid) {
      if (dragFromRow === i) return dragFromRow + 1;
      return i;
    }
  }
  return rows.length;
}

function resolveDropFromPointer(
  clientY: number,
  rows: BodyRow[],
  dragFromRow: number | null,
  setDropBefore: (row: number | null, height?: number) => void,
) {
  const els = document.querySelectorAll<HTMLElement>(".note-body-row");
  if (!els.length) {
    setDropBefore(rows.length);
    return;
  }
  for (let i = 0; i < els.length; i++) {
    const rect = els[i].getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (clientY < mid) {
      if (dragFromRow === i) return;
      setDropBefore(i, rect.height);
      return;
    }
  }
  const last = els[els.length - 1];
  setDropBefore(rows.length, last?.getBoundingClientRect().height ?? DEFAULT_GAP);
}

function NoteBodyRow({
  row,
  rowIndex,
  files,
  isView,
  isDragging,
  onTextChange,
  onTextEnter,
  onDragEmbedStart,
  onDragEmbedEnd,
  onDragOverRow,
  onDropOnRow,
}: {
  row: BodyRow;
  rowIndex: number;
  files: NoteFile[];
  isView: boolean;
  isDragging: boolean;
  onTextChange: (content: string) => void;
  onTextEnter: (caret: number) => void;
  onDragEmbedStart: (rowIndex: number, height: number) => void;
  onDragEmbedEnd: () => void;
  onDragOverRow: (height: number) => void;
  onDropOnRow: (embedName?: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isView && row.type === "text" && lineRef.current) autoGrow(lineRef.current);
  }, [row, isView]);

  const dragRowHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const h = rowRef.current?.getBoundingClientRect().height ?? DEFAULT_GAP;
      onDragOverRow(h);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDropOnRow(e.dataTransfer.getData(EMBED_MIME) || undefined);
    },
  };

  if (row.type === "text") {
    if (isView && !row.content) return null;
    return (
      <div
        ref={rowRef}
        className={`note-body-row note-body-row--text${isDragging ? " is-dragging" : ""}`}
        data-row={rowIndex}
        {...dragRowHandlers}
      >
        {isView ? (
          <span className="note-body-text">{row.content || "\u00a0"}</span>
        ) : (
          <textarea
            ref={lineRef}
            className="note-body-line-edit"
            value={row.content}
            rows={1}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onTextEnter(e.currentTarget.selectionStart ?? row.content.length);
              }
            }}
          />
        )}
      </div>
    );
  }

  const file = findNoteFile(files, row.name);
  const isImage = isImageEmbed(file);
  const token = embedToken(row.name);
  const blockChildDrag = (e: React.DragEvent) => e.preventDefault();

  return (
    <div
      ref={rowRef}
      className={`note-body-row note-body-row--embed${isDragging ? " is-dragging" : ""}`}
      data-row={rowIndex}
      draggable
      onDragStart={(e) => {
        const h = rowRef.current?.getBoundingClientRect().height ?? DEFAULT_GAP;
        e.dataTransfer.setData(EMBED_MIME, row.name);
        e.dataTransfer.setData("text/plain", token);
        e.dataTransfer.effectAllowed = "move";
        if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 12, 12);
        onDragEmbedStart(rowIndex, h);
      }}
      onDragEnd={onDragEmbedEnd}
      {...dragRowHandlers}
    >
      {isView && isImage && file?.url ? (
        <img className="note-inline-image" src={file.url} alt={row.name} draggable={false} />
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
    </div>
  );
}

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
