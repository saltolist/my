"use client";

import { useGlobalChats } from "@/entities/chat";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function ChatsScreen() {
  const { data, isLoading, error } = useGlobalChats();

  return (
    <PlaceholderScreen title="Чаты" subtitle="Каталог глобальных и локальных чатов — M3+.">
      <DataStatus loading={isLoading} error={error} count={data?.length} label="глобальных чатов" />
    </PlaceholderScreen>
  );
}
