"use client";

import { ImageIcon, Paperclip } from "lucide-react";

import { isNoteImageFile } from "@/shared/lib/noteDraft";
import { Button } from "@/shared/ui/button";
import type { NoteFile } from "@/shared/types";

import { EMBED_MIME } from "./noteBodyEditor/constants";

type NoteFilesPanelProps = {
  files: NoteFile[];
  readOnly?: boolean;
  draggable?: boolean;
  onRemove: (index: number) => void;
};

function NoteFileItemIcon({ file }: { file: NoteFile }) {
  if (isNoteImageFile(file)) {
    return <ImageIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
  }
  return <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function NoteFilesPanel({
  files,
  readOnly = false,
  draggable = false,
  onRemove,
}: NoteFilesPanelProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">Вложения</p>
      {draggable ? (
        <p className="note-files-hint">
          Перетащите в текст заметки — в разметке появится [имя файла]
        </p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {files.map((file, index) => {
          const dragProps = draggable
            ? {
                draggable: true as const,
                onDragStart: (e: React.DragEvent) => {
                  e.dataTransfer.setData(EMBED_MIME, file.name);
                  e.dataTransfer.setData("text/plain", `[${file.name}]`);
                  e.dataTransfer.effectAllowed = "copy";
                },
              }
            : {};

          const content = (
            <>
              <NoteFileItemIcon file={file} />
              <span className="truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-muted-foreground">({file.type || "file"})</span>
            </>
          );

          return (
            <li key={file.id ?? `${file.name}-${index}`}>
              {file.url ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="note-file-item--draggable flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  {...dragProps}
                >
                  {content}
                </a>
              ) : (
                <div
                  className="note-file-item--draggable flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  {...dragProps}
                >
                  {content}
                </div>
              )}
              {!readOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={() => onRemove(index)}
                >
                  Убрать
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
