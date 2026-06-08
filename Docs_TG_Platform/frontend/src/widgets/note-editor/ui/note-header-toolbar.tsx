"use client";

import { Paperclip, Save, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type NoteHeaderToolbarProps = {
  title: string;
  readOnly?: boolean;
  changed?: boolean;
  canDelete?: boolean;
  onTitleChange: (value: string) => void;
  onAttachClick: () => void;
  onSave: () => void;
  onDelete?: () => void;
};

export function NoteHeaderToolbar({
  title,
  readOnly = false,
  changed = true,
  canDelete = false,
  onTitleChange,
  onAttachClick,
  onSave,
  onDelete,
}: NoteHeaderToolbarProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Без названия"
        readOnly={readOnly}
        className="h-auto border-0 px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
        aria-label="Заголовок заметки"
      />
      <div className="flex items-center gap-2">
        {!readOnly ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onAttachClick}>
              <Paperclip className="size-4" />
              Файл
            </Button>
            <Button type="button" size="sm" onClick={onSave} disabled={!changed}>
              <Save className="size-4" />
              Сохранить
            </Button>
          </>
        ) : null}
        {canDelete && onDelete ? (
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" />
            Удалить
          </Button>
        ) : null}
      </div>
    </div>
  );
}
