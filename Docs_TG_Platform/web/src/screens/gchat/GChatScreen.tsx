"use client";

import { MessageSquare } from "lucide-react";

import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { Composer } from "@/widgets/composer";
import { PageHeader } from "@/widgets/page-header";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { useGChatScreen } from "@/screens/gchat/model/useGChatScreen";
import { GlobalChatMessages } from "@/screens/gchat/ui/GlobalChatMessages";

export function GChatScreen() {
  const onBack = useScreenBack();
  const {
    gchatId,
    chat,
    isLoading,
    error,
    flatMessages,
    historyRevision,
    lastAssistantFlat,
    messagesRef,
    sendGChat,
  } = useGChatScreen();

  if (!gchatId) {
    return (
      <ScreenShell header={<PageHeader title="Глобальный чат" onBack={onBack} />}>
        <EmptyState
          icon={<MessageSquare className="size-5" />}
          message="Укажите чат: /gchat/?id=gc1"
          className="min-h-[50vh]"
        />
      </ScreenShell>
    );
  }

  if (isLoading) {
    return (
      <ScreenShell header={<PageHeader title="Глобальный чат" onBack={onBack} />}>
        <EmptyState icon={<MessageSquare className="size-5" />} message="Загрузка чата…" />
      </ScreenShell>
    );
  }

  if (error || !chat) {
    return (
      <ScreenShell header={<PageHeader title="Глобальный чат" onBack={onBack} />}>
        <EmptyState
          icon={<MessageSquare className="size-5" />}
          message={error?.message ?? "Чат не найден"}
        />
      </ScreenShell>
    );
  }

  return (
    <>
      <PageHeader title={chat.title} onBack={onBack} />
      <div className="gchat-layout">
        <GlobalChatMessages
          chatId={gchatId}
          flatMessages={flatMessages}
          historyRevision={historyRevision}
          lastAssistantFlat={lastAssistantFlat}
          messagesRef={messagesRef}
        />
        <Composer scope="gchat" onSubmit={sendGChat} />
      </div>
    </>
  );
}
