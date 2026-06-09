"use client";

import { createPortal } from "react-dom";

import { useNoteBodyEditor } from "@/widgets/note-editor/model/useNoteBodyEditor";
import NoteBodyCanvas from "@/widgets/note-editor/ui/noteBodyEditor/NoteBodyCanvas";
import NoteEmbedDragPreview from "@/widgets/note-editor/ui/noteBodyEditor/NoteEmbedDragPreview";
import { DRAG_CARD_H, DRAG_CARD_W } from "@/widgets/note-editor/ui/noteBodyEditor/constants";
import type { NoteBodyEditorProps } from "@/widgets/note-editor/ui/noteBodyEditor/types";

export type { NoteBodyEditorProps };

export function NoteBodyEditor(props: NoteBodyEditorProps) {
  const {
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
  } = useNoteBodyEditor(props);

  return (
    <>
      <div
        ref={canvasRef}
        className={`note-body-canvas${isView ? " note-body-view note-body-view--rich" : " note-body-edit-canvas"}${isDragging ? " note-body-canvas--dragging" : ""}`}
        onDragOver={handleCanvasDragOver}
        onMouseDown={isView ? handleViewMouseDown : undefined}
        onDoubleClick={isView ? handleViewDoubleClick : undefined}
      >
        <NoteBodyCanvas
          lines={lines}
          files={files}
          isView={isView}
          hasContent={hasContent}
          dragFrom={dragFrom}
          dropBefore={dropBefore}
          imageDropSlot={imageDropSlot}
          dropLineBefore={dropLineBefore}
          dropGapActive={dropGapActive}
          dropLineBeforeActive={dropLineBeforeActive}
          applyLines={applyLines}
          onTextEnter={handleTextEnter}
          onEmbedPointerDown={beginEmbedPointerDrag}
        />
      </div>
      {typeof document !== "undefined" && isDragging && draggedEmbedCell
        ? createPortal(
            <div
              ref={dragFloatMountRef}
              className="note-embed-drag-float"
              style={{
                width: DRAG_CARD_W,
                height: DRAG_CARD_H,
              }}
            >
              <NoteEmbedDragPreview cell={draggedEmbedCell} files={files} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
