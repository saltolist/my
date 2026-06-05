"use client";

import type { ReactNode } from "react";
import {
  isEmbedLine,
  isImageEmbedRow,
  updateTextCell,
  type BodyLine,
  type CellPos,
} from "@/lib/noteEmbeds";
import type { NoteFile } from "@/lib/types";
import ImageGridLine from "./ImageGridLine";
import NoteBodyCell from "./NoteBodyCell";
import NoteBodyDropIndicator from "./NoteBodyDropIndicator";
import type { ImageDropSlot } from "./types";

type Props = {
  lines: BodyLine[];
  files: NoteFile[];
  isView: boolean;
  hasContent: boolean;
  dragFrom: CellPos | null;
  dropBefore: CellPos | null;
  imageDropSlot: ImageDropSlot | null;
  dropLineBefore: number | null;
  dropGapActive: boolean;
  dropLineBeforeActive: boolean;
  applyLines: (next: BodyLine[]) => void;
  onTextEnter: (pos: CellPos, offset: number) => void;
  onEmbedPointerDown: (pos: CellPos, e: React.PointerEvent, line?: BodyLine, lineIndex?: number) => void;
};

export default function NoteBodyCanvas({
  lines,
  files,
  isView,
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
  if (!hasContent && isView) {
    return <span className="note-body-empty">Заметка пустая</span>;
  }

  return (
    <>
      {lines.map((line, li) => {
        const isImageLine = isImageEmbedRow(line, files);
        const leadSlot =
          !isImageLine && dropGapActive && dropBefore!.line === li && dropBefore!.cell === 0 ? (
            <div key={`slot-lead-${li}`} className="note-embed-drop-lead-abs" aria-hidden>
              <NoteBodyDropIndicator axis="horizontal" />
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
              onEmbedPointerDown={(pos, e) => onEmbedPointerDown(pos, e, line, li)}
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
                  if (showFlexSlot) {
                    nodes.push(<NoteBodyDropIndicator key={`slot-flex-${li}-${ci}`} axis="vertical" />);
                  }
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
                      onTextEnter={(at) => onTextEnter({ line: li, cell: ci }, at)}
                      onEmbedPointerDown={(pos, e) => onEmbedPointerDown(pos, e, line, li)}
                    />,
                  );
                  return nodes;
                })}
                {dropGapActive &&
                dropBefore!.line === li &&
                dropBefore!.cell === line.cells.length ? (
                  <NoteBodyDropIndicator key={`slot-flex-tail-${li}`} axis="vertical" />
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
                  onTextEnter={(at) => onTextEnter({ line: li, cell: ci }, at)}
                />
              ))
            )}
          </div>
        );
      })}
      {dropGapActive && dropBefore!.line === lines.length && dropBefore!.cell === 0 ? (
        <div
          key="note-drop-tail"
          className="note-body-line note-body-line--drop-tail"
          data-line={lines.length}
          data-drop-tail="1"
          onDragOver={(e) => e.preventDefault()}
        >
          <NoteBodyDropIndicator axis="horizontal" />
        </div>
      ) : null}
    </>
  );
}
