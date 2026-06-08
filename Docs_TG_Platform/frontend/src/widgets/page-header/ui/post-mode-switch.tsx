"use client";

import { MessageSquare, NotebookPen, PlusIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { PostMode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

export type PostModeSwitchProps = {
  mode: PostMode;
  showComments?: boolean;
  onModeChange: (mode: PostMode) => void;
  onNewNote?: () => void;
  onNewChat?: () => void;
  className?: string;
};

type ModeClusterProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  onAdd?: () => void;
  addLabel?: string;
  icon?: React.ReactNode;
};

function ModeCluster({ label, active, onClick, onAdd, addLabel, icon }: ModeClusterProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="sm"
        onClick={onClick}
        className="gap-1.5"
      >
        {icon}
        {label}
      </Button>
      {active && onAdd ? (
        <IconButton aria-label={addLabel ?? "Добавить"} onClick={onAdd}>
          <PlusIcon className="size-3.5" />
        </IconButton>
      ) : null}
    </div>
  );
}

export function PostModeSwitch({
  mode,
  showComments = false,
  onModeChange,
  onNewNote,
  onNewChat,
  className,
}: PostModeSwitchProps) {
  const handleModeClick = (target: PostMode) => {
    onModeChange(mode === target ? "chat" : target);
  };

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label="Режим поста">
      <ModeCluster
        label="Чат"
        active={mode === "chat"}
        onClick={() => onModeChange("chat")}
        icon={<MessageSquare className="size-3.5" />}
      />
      <ModeCluster
        label="Чаты"
        active={mode === "chats"}
        onClick={() => handleModeClick("chats")}
        onAdd={onNewChat}
        addLabel="Новый чат"
      />
      <ModeCluster
        label="Заметки"
        active={mode === "notes"}
        onClick={() => handleModeClick("notes")}
        onAdd={onNewNote}
        addLabel="Новая заметка"
        icon={<NotebookPen className="size-3.5" />}
      />
      {showComments ? (
        <Button
          type="button"
          variant={mode === "comments" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleModeClick("comments")}
        >
          Комментарии
        </Button>
      ) : null}
    </div>
  );
}
