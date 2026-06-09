"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  linesToBody,
  parseNoteBody,
  segmentsToLines,
  splitLineAtCaret,
  type BodyLine,
  type CellPos,
} from "@/shared/lib/noteEmbeds";
import type { NoteFile } from "@/shared/types";

type Params = {
  body: string;
  files: NoteFile[];
  isView: boolean;
  onBodyChange: (body: string) => void;
};

export function useNoteBodyLines({ body, files, isView, onBodyChange }: Params) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<BodyLine[]>([]);
  const filesRef = useRef<NoteFile[]>(files);
  const pendingTextFocusRef = useRef<CellPos | null>(null);

  const lines = useMemo(() => segmentsToLines(parseNoteBody(body)), [body]);

  useEffect(() => {
    linesRef.current = lines;
    filesRef.current = files;
  }, [files, lines]);

  const applyLines = useCallback(
    (next: BodyLine[]) => {
      onBodyChange(linesToBody(next));
    },
    [onBodyChange],
  );

  const handleTextEnter = useCallback(
    (pos: CellPos, offset: number) => {
      pendingTextFocusRef.current = { line: pos.line + 1, cell: 0 };
      applyLines(splitLineAtCaret(linesRef.current, pos, offset));
    },
    [applyLines],
  );

  useLayoutEffect(() => {
    const target = pendingTextFocusRef.current;
    if (!target || isView) return;
    pendingTextFocusRef.current = null;
    requestAnimationFrame(() => {
      const textarea = canvasRef.current?.querySelector<HTMLTextAreaElement>(
        `.note-body-cell--text[data-line="${target.line}"][data-cell="${target.cell}"] .note-body-line-edit`,
      );
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(0, 0);
    });
  }, [lines, isView]);

  const hasContent = lines.some((l) => l.cells.some((c) => (c.type === "text" ? c.content.trim() : true)));

  return {
    canvasRef,
    linesRef,
    filesRef,
    lines,
    files,
    applyLines,
    handleTextEnter,
    hasContent,
  };
}
