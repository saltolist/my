"use client";

import type { ReactNode } from "react";
import {
  isEmbedLine,
  isImageEmbedRow,
  updateTextCell,
  type BodyLine,
  type CellPos,
} from "@/shared/lib/noteEmbeds";
import type { NoteFile } from "@/shared/types";

import ImageGridLine from "./ImageGridLine";
import NoteBodyCell from "./NoteBodyCell";
import NoteBodyDropIndicator from "./NoteBodyDropIndicator";

type Props = {
  lines: BodyLine[];
  files: NoteFile[];
  hasContent: boolean;
  dragFrom: CellPos | null;
  dropBefore: CellPos | null;
  imageDropSlot: { line: number; slot: number } | null;
  dropLineBefore: number | null;
  dropGapActive: boolean;
  dropLineBeforeActive: boolean;
  applyLines: (next: BodyLine[]) => void;
  onTextEnter: (pos: CellPos, offset: number) => void;
  onEmbedPointerDown: (pos: CellPos, e: React.PointerEvent, line?: BodyLine, lineIndex?: number) => void;
};

export default function NoteBodyDocumentView({
  lines,
  files,
  hasContent,
  dragFrom,
  dropBefore,
  imageDropSlot,
  dropLineBefore,
  dropGapActive,
  dropLineBeforeActive,
  applyLines,
  onTextEnter,
  onEmbedPointerDown,
}: Props) {
  if (!hasContent) {
    return <span className="note-body-empty">Заметка пустая</span>;
  }

  const nodes: ReactNode[] = [];

  lines.forEach((line, li) => {
    const isImageLine = isImageEmbedRow(line, files);

    if (
      dropGapActive &&
      dropBefore != null &&
      dropBefore.line === li &&
      dropBefore.cell === 0 &&
      !isImageLine
    ) {
      nodes.push(
        <span key={`drop-lead-${li}`} className="note-body-doc-drop-break" aria-hidden>
          <NoteBodyDropIndicator axis="horizontal" />
        </span>,
      );
    }

    if (isImageLine) {
      nodes.push(
        <ImageGridLine
          key={`line-${li}`}
          line={line}
          lineIndex={li}
          lines={lines}
          files={files}
          isView
          dragFrom={dragFrom}
          imageDropSlot={imageDropSlot}
          dropSlotBefore={dropLineBeforeActive && dropLineBefore === li}
          onEmbedPointerDown={(pos, e) => onEmbedPointerDown(pos, e, line, li)}
        />,
      );
      return;
    }

    if (isEmbedLine(line)) {
      const embedNodes: ReactNode[] = [];
      line.cells.forEach((cell, ci) => {
        if (
          dropGapActive &&
          dropBefore != null &&
          dropBefore.line === li &&
          dropBefore.cell === ci
        ) {
          embedNodes.push(<NoteBodyDropIndicator key={`slot-flex-${li}-${ci}`} axis="vertical" />);
        }
        const lifted = dragFrom?.line === li && dragFrom.cell === ci;
        embedNodes.push(
          <NoteBodyCell
            key={`cell-${li}-${ci}-${cell.type === "embed" ? cell.name : "t"}`}
            cell={cell}
            pos={{ line: li, cell: ci }}
            files={files}
            isView
            isDragLifted={lifted}
            onTextChange={(content) => applyLines(updateTextCell(lines, { line: li, cell: ci }, content))}
            onTextEnter={(at) => onTextEnter({ line: li, cell: ci }, at)}
            onEmbedPointerDown={(pos, e) => onEmbedPointerDown(pos, e, line, li)}
          />,
        );
      });
      if (
        dropGapActive &&
        dropBefore != null &&
        dropBefore.line === li &&
        dropBefore.cell === line.cells.length
      ) {
        embedNodes.push(<NoteBodyDropIndicator key={`slot-flex-tail-${li}`} axis="vertical" />);
      }
      nodes.push(
        <div key={`line-${li}`} className="note-body-doc-line note-body-doc-line--embed" data-line={li}>
          {embedNodes}
        </div>,
      );
      return;
    }

    line.cells.forEach((cell, ci) => {
      nodes.push(
        <div key={`line-${li}-${ci}`} className="note-body-doc-line note-body-doc-line--text" data-line={li}>
          <NoteBodyCell
            cell={cell}
            pos={{ line: li, cell: ci }}
            files={files}
            isView
            onTextChange={(content) => applyLines(updateTextCell(lines, { line: li, cell: ci }, content))}
            onTextEnter={(at) => onTextEnter({ line: li, cell: ci }, at)}
          />
        </div>,
      );
    });
  });

  if (dropGapActive && dropBefore != null && dropBefore.line === lines.length && dropBefore.cell === 0) {
    nodes.push(
      <div
        key="note-drop-tail"
        className="note-body-line note-body-line--drop-tail"
        data-line={lines.length}
        data-drop-tail="1"
        onDragOver={(e) => e.preventDefault()}
      >
        <NoteBodyDropIndicator axis="horizontal" />
      </div>,
    );
  }

  return <div className="note-body-document note-body-document--view">{nodes}</div>;
}
