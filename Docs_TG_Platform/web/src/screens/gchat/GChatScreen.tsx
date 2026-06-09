"use client";

import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { useGlobalChat } from "@/entities/chat";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { parseGChatSearchParam } from "@/shared/lib/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

export function GChatScreen() {
  const searchParams = useSearchParams();
  const onBack = useScreenBack();
  const gchatId = parseGChatSearchParam(searchParams.get("id"));
  const { data: chat, isLoading, error } = useGlobalChat(gchatId);

  return (
    <ScreenShell
      header={<PageHeader title={chat?.title ?? "Глобальный чат"} onBack={onBack} />}
    >
      <EmptyState
        icon={<MessageSquare className="size-5" />}
        message={
          !gchatId
            ? "Укажите чат: /gchat/?id=gc1"
            : isLoading
              ? "Загрузка чата…"
              : error
                ? error.message
                : "Chat thread + composer — M3+."
        }
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
