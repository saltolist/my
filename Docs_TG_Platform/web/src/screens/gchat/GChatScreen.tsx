"use client";

import { useSearchParams } from "next/navigation";
import { useGlobalChat } from "@/entities/chat";
import { parseGChatSearchParam } from "@/shared/lib/routes";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function GChatScreen() {
  const searchParams = useSearchParams();
  const gchatId = parseGChatSearchParam(searchParams.get("id"));
  const { data: chat, isLoading, error } = useGlobalChat(gchatId);

  return (
    <PlaceholderScreen
      title={chat?.title ?? "Глобальный чат"}
      subtitle="Chat thread + composer — M3+."
    >
      {!gchatId ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Укажите чат через query: /gchat/?id=gc1
        </p>
      ) : (
        <DataStatus loading={isLoading} error={error} count={chat ? 1 : 0} label={`чата ${gchatId}`} />
      )}
    </PlaceholderScreen>
  );
}
