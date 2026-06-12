import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";
import type { ChatsRepository, GlobalChatPatch } from "@/shared/api/repositories";
import { lastUserPreviewFromVisibleHistory, normalizeBranchedHistory } from "@/shared/lib/chatPaths";
import type { ChatMessage, GlobalChat } from "@/shared/types";

/** Синхронизировать список global chats в React Query с ответом API. */
export function syncGlobalChatInCache(queryClient: QueryClient, updated: GlobalChat): void {
  queryClient.setQueryData<GlobalChat[]>(queryKeys.globalChats.list(), (prev) =>
    prev?.map((c) => (c.id === updated.id ? updated : c)),
  );
}

/** Актуальный чат с бэкенда (MSW, seed или production API). */
export async function fetchGlobalChat(
  queryClient: QueryClient,
  chats: ChatsRepository,
  chatId: string,
): Promise<GlobalChat> {
  const list = await queryClient.fetchQuery({
    queryKey: queryKeys.globalChats.list(),
    queryFn: () => chats.listGlobal(),
  });
  const chat = list.find((c) => c.id === chatId);
  if (!chat) throw new Error(`Chat ${chatId} not found`);
  return chat;
}

export type PatchGlobalChatHistoryOptions = {
  preview?: string;
};

/**
 * Read-modify-write для `history`: GET (через fetchQuery) → transform → PATCH → cache ← response.
 * Единственный путь мутации дерева сообщений global chat в клиенте.
 */
export async function patchGlobalChatHistory(
  queryClient: QueryClient,
  chats: ChatsRepository,
  chatId: string,
  updater: (history: ChatMessage[]) => ChatMessage[],
  options?: PatchGlobalChatHistoryOptions,
): Promise<GlobalChat> {
  const chat = await fetchGlobalChat(queryClient, chats, chatId);
  const history = updater(normalizeBranchedHistory(chat.history));
  const patch: GlobalChatPatch = {
    history,
    preview: options?.preview ?? lastUserPreviewFromVisibleHistory(history).slice(0, 80),
    date: "сейчас",
  };
  const updated = await chats.update(chatId, patch);
  syncGlobalChatInCache(queryClient, updated);
  return updated;
}
