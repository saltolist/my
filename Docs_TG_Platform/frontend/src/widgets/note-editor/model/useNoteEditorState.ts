"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeNoteBody } from "@/shared/lib/noteEmbeds";
import { buildNoteSnapshot } from "@/shared/lib/noteDraft";
import type { NoteFile } from "@/shared/types";

type UseNoteEditorStateOptions = {
  title: string;
  body: string;
  ai: boolean;
  files: NoteFile[];
  baselineSnapshot?: string;
  isNew?: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAiChange: (value: boolean) => void;
  onFilesChange: (files: NoteFile[]) => void;
};

export function useNoteEditorState({
  title,
  body,
  ai,
  files,
  baselineSnapshot,
  isNew = false,
  onTitleChange,
  onBodyChange,
  onAiChange,
  onFilesChange,
}: UseNoteEditorStateOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [noteMode, setNoteMode] = useState<"view" | "edit">(isNew ? "edit" : "view");
  const [bodyFocusRequest, setBodyFocusRequest] = useState(0);

  const isView = noteMode === "view" && !isNew;

  useEffect(() => {
    if (isNew) setNoteMode("edit");
  }, [isNew]);

  const normalizedBody = useMemo(() => normalizeNoteBody(body, files), [body, files]);

  const changed = useMemo(() => {
    if (!baselineSnapshot) return true;
    return buildNoteSnapshot(title, normalizedBody, ai, files) !== baselineSnapshot;
  }, [ai, baselineSnapshot, files, normalizedBody, title]);

  const setEditMode = useCallback(() => {
    setNoteMode("edit");
    setBodyFocusRequest((n) => n + 1);
  }, []);

  const setViewMode = useCallback(() => {
    setNoteMode("view");
  }, []);

  const addFile = useCallback(
    (file: File) => {
      const entry: NoteFile = {
        id: `f-${Date.now()}`,
        name: file.name,
        type: file.type || "file",
        url: URL.createObjectURL(file),
      };
      onFilesChange([...files, entry]);
      return entry;
    },
    [files, onFilesChange],
  );

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      addFile(file);
      e.target.value = "";
    },
    [addFile],
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  return {
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
    onTitleChange,
    onBodyChange,
    onAiChange,
    title,
    ai,
    files,
  };
}
