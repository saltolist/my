"use client";

import { Button } from "@/shared/ui/button";
import type { NoteFile } from "@/shared/types";

type NoteFilesPanelProps = {
  files: NoteFile[];
  readOnly?: boolean;
  onRemove: (index: number) => void;
};

export function NoteFilesPanel({ files, readOnly = false, onRemove }: NoteFilesPanelProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">Вложения</p>
      <ul className="flex flex-col gap-1">
        {files.map((file, index) => (
          <li
            key={file.id ?? `${file.name}-${index}`}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span className="truncate">{file.name}</span>
            {!readOnly ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
                Убрать
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
