"use client";

import { Send } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SearchField } from "@/shared/ui/search-field";
import { cn } from "@/shared/lib/utils";
import type { LocalChat } from "@/shared/types";

export type LocalChatsListProps = {
  chats: LocalChat[];
  currentChatId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  className?: string;
};

export function LocalChatsList({
  chats,
  currentChatId,
  search,
  onSearchChange,
  onSelectChat,
  onNewChat,
  className,
}: LocalChatsListProps) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? chats.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q),
      )
    : chats;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <SearchField
        placeholder="Поиск чатов…"
        value={search}
        onChange={onSearchChange}
        aria-label="Поиск чатов"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет локальных чатов</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={cn(
                "rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                currentChatId === chat.id && "border-primary bg-primary/5",
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{chat.title}</span>
                <span className="text-xs text-muted-foreground">{chat.date}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {chat.preview}
              </p>
              {chat.ai ? (
                <Badge variant="secondary" className="mt-2">
                  в контексте ИИ
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" className="w-fit" onClick={onNewChat}>
        <Send className="size-3.5" />
        Новый чат
      </Button>
    </div>
  );
}
