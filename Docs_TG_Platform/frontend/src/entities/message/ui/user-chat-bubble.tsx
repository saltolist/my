"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { clampActiveBranchIndex, displayUserText } from "@/shared/lib/chatPaths";
import { Button } from "@/shared/ui/button";
import { CopyButton } from "@/shared/ui/copy-button";
import { Textarea } from "@/shared/ui/textarea";
import { ChatBubble, MessageText } from "@/entities/message/ui/chat-bubble";
import { ChatBranchNav } from "@/entities/message/ui/chat-branch-nav";
import type { ChatMessage } from "@/shared/types";

export type UserChatBubbleProps = {
  message: ChatMessage;
  path: number[];
  onUserBranchChange?: (path: number[], branchIdx: number) => void;
  onUserMessageSave?: (path: number[], newText: string) => void;
};

export function UserChatBubble({
  message,
  path,
  onUserBranchChange,
  onUserMessageSave,
}: UserChatBubbleProps) {
  const shown = displayUserText(message);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(shown);

  const branchCount = message.userBranches?.length ?? 0;
  const branchIdx = clampActiveBranchIndex(message);

  useEffect(() => {
    if (!editing) setDraft(shown);
  }, [shown, editing]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onUserMessageSave?.(path, trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(shown);
    setEditing(false);
  };

  return (
    <div className="group flex justify-end">
      <div className="flex max-w-[min(100%,42rem)] flex-col items-end gap-1">
        <ChatBubble role="user" editing={editing}>
          {!editing && onUserMessageSave ? (
            <div className="absolute -left-20 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 bg-background/80 shadow-sm"
                aria-label="Редактировать"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <CopyButton text={shown} className="size-7 bg-background/80 shadow-sm" />
            </div>
          ) : null}

          {editing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === "Escape") handleCancel();
                }}
                rows={2}
                className="min-h-10 resize-none border-0 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
                aria-label="Текст сообщения"
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={handleSave}>
                  Сохранить
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <MessageText text={shown} />
          )}
        </ChatBubble>

        {!editing ? (
          <ChatBranchNav
            branchIdx={branchIdx}
            branchCount={branchCount}
            onBranchChange={(idx) => onUserBranchChange?.(path, idx)}
          />
        ) : null}
      </div>
    </div>
  );
}
