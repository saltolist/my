"use client";

import { useEffect, useRef } from "react";

import { AiChatBubble, UserChatBubble } from "@/entities/message";
import { flattenVisibleWithPaths } from "@/shared/lib/chatPaths";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import type { ChatMessage } from "@/shared/types";

type ChatThreadProps = {
  history: ChatMessage[];
  onUserBranchChange?: (path: number[], branchIdx: number) => void;
  onAiVariantChange?: (path: number[], variantIdx: number) => void;
  onUserMessageSave?: (path: number[], newText: string) => void;
  className?: string;
};

export function ChatThread({
  history,
  onUserBranchChange,
  onAiVariantChange,
  onUserMessageSave,
  className,
}: ChatThreadProps) {
  const flat = flattenVisibleWithPaths(history);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [flat.length]);

  if (flat.length === 0) {
    return (
      <div className={cn("flex flex-1 items-center justify-center p-8", className)}>
        <p className="text-sm text-muted-foreground">Начните диалог — напишите сообщение ниже</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {flat.map(({ message, path }) =>
          message.role === "user" ? (
            <UserChatBubble
              key={path.join("-")}
              message={message}
              path={path}
              onUserBranchChange={onUserBranchChange}
              onUserMessageSave={onUserMessageSave}
            />
          ) : (
            <AiChatBubble
              key={path.join("-")}
              message={message}
              path={path}
              onAiVariantChange={onAiVariantChange}
            />
          ),
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
