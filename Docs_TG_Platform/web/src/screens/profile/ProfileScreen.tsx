"use client";

import { useChannelProfile } from "@/entities/channel";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function ProfileScreen() {
  const { data, isLoading, error } = useChannelProfile();

  return (
    <PlaceholderScreen title="Профиль" subtitle="Настройки канала, ИИ и Telegram — M3+.">
      {isLoading || error ? (
        <DataStatus loading={isLoading} error={error} label="профиля канала" />
      ) : (
        <p className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Канал: {data?.core.topic ?? "—"}
        </p>
      )}
    </PlaceholderScreen>
  );
}
