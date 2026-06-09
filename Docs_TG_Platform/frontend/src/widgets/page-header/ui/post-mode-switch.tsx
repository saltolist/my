"use client";

import { MessageSquare, NotebookPen } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { PostMode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { ModeCluster } from "@/widgets/page-header/ui/mode-cluster";

export type PostModeSwitchProps = {
  mode: PostMode;
  showComments?: boolean;
  onModeChange: (mode: PostMode) => void;
  onNewNote?: () => void;
  onNewChat?: () => void;
  className?: string;
};

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
