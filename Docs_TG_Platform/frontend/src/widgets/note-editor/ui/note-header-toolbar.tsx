"use client";

import { Eye, Paperclip, Pencil, Save, Trash2, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type NoteHeaderToolbarProps = {
  title: string;
  mode?: "view" | "edit";
  readOnly?: boolean;
  changed?: boolean;
  canDelete?: boolean;
  showModeToggle?: boolean;
  showCancel?: boolean;
  onTitleChange: (value: string) => void;
  onAttachClick: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onToggleMode?: () => void;
  onCancel?: () => void;
};

export function NoteHeaderToolbar({
  title,
  mode = "edit",
  readOnly = false,
  changed = true,
  canDelete = false,
  showModeToggle = false,
  showCancel = false,
  onTitleChange,
  onAttachClick,
  onSave,
  onDelete,
  onToggleMode,
  onCancel,
}: NoteHeaderToolbarProps) {
  const isView = mode === "view";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Без названия"
        readOnly={readOnly || isView}
        className="h-auto border-0 px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
        aria-label="Заголовок заметки"
      />
      <div className="flex items-center gap-2">
        {showModeToggle && onToggleMode ? (
          <Button type="button" variant="outline" size="sm" onClick={onToggleMode}>
            {isView ? (
              <>
                <Pencil className="size-4" />
                Редактировать
              </>
            ) : (
              <>
                <Eye className="size-4" />
                Просмотр
              </>
            )}
          </Button>
        ) : null}
        {!readOnly && !isView ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onAttachClick}>
              <Paperclip className="size-4" />
              Файл
            </Button>
            {showCancel && onCancel ? (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <X className="size-4" />
                Отмена
              </Button>
            ) : null}
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
