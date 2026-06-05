"use client";

import { createPortal } from "react-dom";
import { DRAG_CARD_H, DRAG_CARD_W } from "@/components/note/noteBodyEditor/constants";
import NoteBodyCanvas from "@/components/note/noteBodyEditor/NoteBodyCanvas";
import NoteEmbedDragPreview from "@/components/note/noteBodyEditor/NoteEmbedDragPreview";
import type { NoteBodyEditorProps } from "@/components/note/noteBodyEditor/types";
import { useNoteBodyEditor } from "@/lib/hooks/useNoteBodyEditor";

export default function NoteBodyEditor(props: NoteBodyEditorProps) {
  const editor = useNoteBodyEditor(props);

  return (
    <>
      <div
        ref={editor.canvasRef}
        className={`note-body-canvas${editor.isView ? " note-body-view note-body-view--rich" : " note-body-edit-canvas"}${editor.isDragging ? " note-body-canvas--dragging" : ""}`}
        onDragOver={editor.handleCanvasDragOver}
        onMouseDown={editor.isView ? editor.handleViewMouseDown : undefined}
        onDoubleClick={editor.isView ? editor.handleViewDoubleClick : undefined}
      >
        <NoteBodyCanvas
          lines={editor.lines}
          files={editor.files}
          isView={editor.isView}
          hasContent={editor.hasContent}
          dragFrom={editor.dragFrom}
          dropBefore={editor.dropBefore}
          imageDropSlot={editor.imageDropSlot}
          dropLineBefore={editor.dropLineBefore}
          dropGapActive={editor.dropGapActive}
          dropLineBeforeActive={editor.dropLineBeforeActive}
          applyLines={editor.applyLines}
          onTextEnter={editor.handleTextEnter}
          onEmbedPointerDown={editor.beginEmbedPointerDrag}
        />
      </div>
      {typeof document !== "undefined" &&
        editor.isDragging &&
        editor.draggedEmbedCell &&
        createPortal(
          <div
            ref={editor.dragFloatMountRef}
            className="note-embed-drag-float"
            style={{
              width: DRAG_CARD_W,
              height: DRAG_CARD_H,
            }}
          >
            <NoteEmbedDragPreview cell={editor.draggedEmbedCell} files={editor.files} />
          </div>,
          document.body,
        )}
    </>
  );
}
