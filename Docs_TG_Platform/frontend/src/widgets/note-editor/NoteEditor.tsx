"use client";

import { useMemo } from "react";

import { buildNoteSnapshot, draftNoteTitle } from "@/shared/lib/noteDraft";
import { cn } from "@/shared/lib/utils";
import type { NoteFile } from "@/shared/types";

import { useNoteEditorState } from "./model/useNoteEditorState";
import { NoteAiPanel } from "./ui/note-ai-panel";
import { NoteBodyEditor } from "./ui/note-body-editor";
import { NoteFilesPanel } from "./ui/note-files-panel";
import { NoteHeaderToolbar } from "./ui/note-header-toolbar";
import { NoteHiddenFileInput } from "./ui/note-hidden-file-input";

export type NoteEditorProps = {
  title: string;
  body: string;
  ai: boolean;
  files: NoteFile[];
  date?: string;
  isNew?: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAiChange: (value: boolean) => void;
  onFilesChange: (files: NoteFile[]) => void;
  onSave: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  baselineSnapshot?: string;
  readOnly?: boolean;
  className?: string;
};

export function NoteEditor({
  title,
  body,
  ai,
  files,
  date,
  isNew = false,
  onTitleChange,
  onBodyChange,
  onAiChange,
  onFilesChange,
  onSave,
  onCancel,
  onDelete,
  baselineSnapshot,
  readOnly = false,
  className,
}: NoteEditorProps) {
  const {
    fileInputRef,
    isView,
    changed,
    normalizedBody,
    bodyFocusRequest,
    setEditMode,
    setViewMode,
    addFile,
    handleFilePick,
    removeFile,
  } = useNoteEditorState({
    title,
    body,
    ai,
    files,
    baselineSnapshot,
    isNew,
    onTitleChange,
    onBodyChange,
    onAiChange,
    onFilesChange,
  });

  const effectiveReadOnly = readOnly || isView;

  const handleCancel = () => {
    onCancel?.();
    setViewMode();
  };

  const showCancel = useMemo(() => {
    if (!baselineSnapshot) return false;
    return buildNoteSnapshot(title, normalizedBody, ai, files) !== baselineSnapshot;
  }, [ai, baselineSnapshot, files, normalizedBody, title]);

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6", className)}>
      <NoteHeaderToolbar
        title={title}
        mode={isView ? "view" : "edit"}
        readOnly={readOnly}
        changed={changed}
        canDelete={Boolean(onDelete)}
        showModeToggle={!isNew && !readOnly}
        showCancel={showCancel}
        onTitleChange={onTitleChange}
        onAttachClick={() => fileInputRef.current?.click()}
        onSave={onSave}
        onDelete={onDelete}
        onToggleMode={isView ? setEditMode : setViewMode}
        onCancel={handleCancel}
      />

      <NoteAiPanel ai={ai} readOnly={effectiveReadOnly} onAiChange={onAiChange} />

      <NoteBodyEditor
        body={normalizedBody}
        files={files}
        isView={effectiveReadOnly}
        onBodyChange={onBodyChange}
        onAddFile={addFile}
        onEditRequest={setEditMode}
        focusRequest={bodyFocusRequest}
      />

      <NoteFilesPanel
        files={files}
        readOnly={effectiveReadOnly}
        draggable={!effectiveReadOnly}
        onRemove={removeFile}
      />

      {date ? (
        <p className="text-xs text-muted-foreground">Обновлена: {date}</p>
      ) : null}

      {!effectiveReadOnly ? (
        <NoteHiddenFileInput inputRef={fileInputRef} onChange={handleFilePick} />
      ) : null}
    </div>
  );
}

export { draftNoteTitle };
