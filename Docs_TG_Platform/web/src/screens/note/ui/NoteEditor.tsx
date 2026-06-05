"use client";

import NoteBodyEditor from "@/widgets/note-editor/ui/NoteBodyEditor";
import NoteFilesPanel from "@/widgets/note-editor/ui/NoteFilesPanel";
import NoteHeaderToolbar from "@/widgets/note-editor/ui/NoteHeaderToolbar";
import { useNoteEditor } from "@/screens/note/model/useNoteEditor";
import type { ActiveNote } from "@/shared/types";

export default function NoteEditor({ note }: { note: ActiveNote }) {
  const editor = useNoteEditor(note);

  return (
    <div className="note-layout">
      <div className="note-shell">
        <div className="note-shell-header">
          <div className="note-title-block">
            <div className="note-title-row">
              <textarea
                ref={editor.titleRef}
                className="note-title-edit"
                rows={1}
                placeholder="Без названия"
                value={editor.title}
                onChange={(e) => editor.setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  editor.focusBodyFromTitle();
                }}
              />
            </div>
          </div>
          <NoteHeaderToolbar
            mode={editor.isView ? "view" : "edit"}
            showAttach={!editor.isView}
            onAttach={() => editor.fileInputRef.current?.click()}
            showModeToggle={!note.isNew}
            onToggleMode={editor.isView ? editor.setEditMode : editor.setViewMode}
            onSave={editor.save}
            onCancel={editor.cancel}
            saveDisabled={!editor.changed}
            showCancel={editor.changed}
          />
        </div>
        <div className="note-shell-content">
          <NoteBodyEditor
            body={editor.body}
            files={editor.files}
            isView={editor.isView}
            onBodyChange={editor.setBody}
            onAddFile={editor.addFile}
            onEditRequest={editor.setEditMode}
            focusRequest={editor.bodyFocusRequest}
          />
          <NoteFilesPanel files={editor.files} draggable />
        </div>
      </div>
      <div className="note-timestamps">
        Создана: {note.date} &nbsp;•&nbsp; Изменена: {editor.changed ? "сейчас" : note.date}
      </div>
      {!editor.isView ? (
        <input
          type="file"
          ref={editor.fileInputRef}
          style={{ display: "none" }}
          onChange={editor.onFilePicked}
        />
      ) : null}
    </div>
  );
}
