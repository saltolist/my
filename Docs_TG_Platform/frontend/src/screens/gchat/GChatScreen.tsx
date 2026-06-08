"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useGlobalChat, useUpdateGlobalChat } from "@/entities/chat/model/useGlobalChats";
import { useDeleteChat } from "@/features/delete-chat";
import { useSendGlobalMessage } from "@/features/send-message";
import {
  applyUserMessageSave,
  mapMessageAtPath,
  setActiveUserBranch,
} from "@/shared/lib/chatPaths";
import { GCHAT_ID_PARAM, parseGChatSearchParam, routes } from "@/shared/lib/routes";
import type { ChatMessage } from "@/shared/types";
import { Skeleton } from "@/shared/ui/skeleton";
import { ChatThread } from "@/widgets/chat-thread";
import { Composer } from "@/widgets/composer";
import { PageHeader, PageHeaderMenuButton } from "@/widgets/page-header";

export function GChatScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = parseGChatSearchParam(searchParams.get(GCHAT_ID_PARAM));
  const { data: chat, isLoading } = useGlobalChat(chatId);
  const updateChat = useUpdateGlobalChat();
  const deleteChat = useDeleteChat();
  const sendMessage = useSendGlobalMessage("gchat");

  const breadcrumbs = useMemo(
    () => [
      { label: "Чаты", href: routes.chats() },
      { label: chat?.title ?? "Чат" },
    ],
    [chat?.title],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!chatId) return false;
      return sendMessage(chatId, text);
    },
    [chatId, sendMessage],
  );

  const patchHistory = useCallback(
    (history: ChatMessage[]) => {
      if (!chatId) return;
      void updateChat.mutateAsync({ chatId, patch: { history } });
    },
    [chatId, updateChat],
  );

  const handleUserBranchChange = useCallback(
    (path: number[], branchIdx: number) => {
      if (!chat) return;
      patchHistory(setActiveUserBranch(chat.history, path, branchIdx));
    },
    [chat, patchHistory],
  );

  const handleAiVariantChange = useCallback(
    (path: number[], variantIdx: number) => {
      if (!chat) return;
      patchHistory(
        mapMessageAtPath(chat.history, path, (m) => ({ ...m, selectedVariant: variantIdx })),
      );
    },
    [chat, patchHistory],
  );

  const handleUserMessageSave = useCallback(
    (path: number[], newText: string) => {
      if (!chat) return;
      patchHistory(applyUserMessageSave(chat.history, path, newText));
    },
    [chat, patchHistory],
  );

  const handleDelete = useCallback(() => {
    if (!chat) return;
    if (!confirm(`Удалить чат «${chat.title}»?`)) return;
    void deleteChat.mutateAsync(chat.id).then(() => {
      router.push(routes.chats());
    });
  }, [chat, deleteChat, router]);

  if (!chatId) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: "Чаты", href: routes.chats() }, { label: "Чат" }]} />
        <p className="p-8 text-sm text-muted-foreground">Чат не выбран</p>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader breadcrumbs={breadcrumbs} />
        <div className="flex flex-col gap-4 p-8">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="ml-auto h-16 w-1/2" />
        </div>
      </>
    );
  }

  if (!chat) {
    return (
      <>
        <PageHeader breadcrumbs={breadcrumbs} />
        <p className="p-8 text-sm text-muted-foreground">Чат не найден</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        actions={
          <PageHeaderMenuButton
            items={[{ label: "Удалить чат", onClick: handleDelete, variant: "destructive" }]}
            aria-label="Меню чата"
          />
        }
      />
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <ChatThread
          history={chat.history}
          className="flex-1"
          onUserBranchChange={handleUserBranchChange}
          onAiVariantChange={handleAiVariantChange}
          onUserMessageSave={handleUserMessageSave}
        />
        <div className="shrink-0 border-t bg-background p-4">
          <div className="mx-auto max-w-3xl">
            <Composer scope="gchat" onSubmit={handleSend} />
          </div>
        </div>
      </div>
    </>
  );
}
