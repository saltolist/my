"use client";

import { MessageSquare } from "lucide-react";

import { useNavigationStore } from "@/app/model/store";
import { useGlobalChat } from "@/entities/chat";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

export function GChatScreen() {
  const onBack = useScreenBack();
  const gchatId = useNavigationStore((s) => s.currentGChatId);
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
