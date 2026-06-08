"use client";

import { useCallback, useMemo, useRef } from "react";

import { buildNoteSnapshot, draftNoteTitle } from "@/shared/lib/noteDraft";
import { cn } from "@/shared/lib/utils";
import type { NoteFile } from "@/shared/types";

import { NoteBodyEditor } from "./ui/note-body-editor";
import { NoteEmbedDragPreview } from "./ui/note-embed-drag-preview";
import { NoteFilesPanel } from "./ui/note-files-panel";
import { NoteHeaderToolbar } from "./ui/note-header-toolbar";

export type NoteEditorProps = {
  title: string;
  body: string;
  ai: boolean;
  files: NoteFile[];
  date?: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAiChange: (value: boolean) => void;
  onFilesChange: (files: NoteFile[]) => void;
  onSave: () => void;
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
  onTitleChange,
  onBodyChange,
  onAiChange,
  onFilesChange,
  onSave,
  onDelete,
  baselineSnapshot,
  readOnly = false,
  className,
}: NoteEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const changed = useMemo(() => {
    if (!baselineSnapshot) return true;
    return buildNoteSnapshot(title, body, ai, files) !== baselineSnapshot;
  }, [ai, baselineSnapshot, body, files, title]);

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const entry: NoteFile = {
        id: `f-${Date.now()}`,
        name: file.name,
        type: file.type || "file",
        url: URL.createObjectURL(file),
      };
      onFilesChange([...files, entry]);
      e.target.value = "";
    },
    [files, onFilesChange],
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6", className)}>
      <NoteHeaderToolbar
        title={title}
        readOnly={readOnly}
        changed={changed}
        canDelete={Boolean(onDelete)}
        onTitleChange={onTitleChange}
        onAttachClick={() => fileInputRef.current?.click()}
        onSave={onSave}
        onDelete={onDelete}
      />

      <NoteBodyEditor
        body={body}
        ai={ai}
        readOnly={readOnly}
        onBodyChange={onBodyChange}
        onAiChange={onAiChange}
      />

      <NoteFilesPanel files={files} readOnly={readOnly} onRemove={removeFile} />

      {date ? (
        <p className="text-xs text-muted-foreground">Обновлена: {date}</p>
      ) : null}

      <NoteEmbedDragPreview visible={false} />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFilePick}
      />
    </div>
  );
}

export { draftNoteTitle };
