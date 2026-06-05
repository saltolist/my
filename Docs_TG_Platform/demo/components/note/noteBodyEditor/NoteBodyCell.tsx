"use client";

import { useEffect, useRef } from "react";
import { embedToken, findNoteFile, isImageEmbed, type CellPos, type LineCell } from "@/lib/noteEmbeds";
import type { NoteFile } from "@/lib/types";

type Props = {
  cell: LineCell;
  pos: CellPos;
  files: NoteFile[];
  isView: boolean;
  isPlaceholder?: boolean;
  isDragLifted?: boolean;
  onTextChange: (content: string) => void;
  onTextEnter: (caret: number) => void;
  onEmbedPointerDown?: (pos: CellPos, e: React.PointerEvent) => void;
};

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export default function NoteBodyCell({
  cell,
  pos,
  files,
  isView,
  isPlaceholder = false,
  isDragLifted = false,
  onTextChange,
  onTextEnter,
  onEmbedPointerDown,
}: Props) {
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
      <span
        ref={cellRef}
        className="note-body-cell note-body-cell--text"
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
        // eslint-disable-next-line @next/next/no-img-element
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
