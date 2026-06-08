"use client";

import { useTelegramProfile } from "@/entities/channel/model/useProfile";
import type { TelegramChannelStatus } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const channelStatusLabel: Record<TelegramChannelStatus, string> = {
  idle: "Не подключён",
  pending: "Ожидание",
  connected: "Подключён",
};

export function TelegramChannelSection() {
  const { data: telegramProfile } = useTelegramProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Канал Telegram</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Канал</Label>
          <Input readOnly value={telegramProfile?.channel ?? "—"} />
        </div>
        <div className="grid gap-1.5">
          <Label>Статус канала</Label>
          <Input
            readOnly
            value={channelStatusLabel[telegramProfile?.channelStatus ?? "idle"] ?? "—"}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Последняя синхронизация</Label>
          <Input readOnly value={telegramProfile?.lastSync ?? "—"} />
        </div>
      </CardContent>
    </Card>
  );
}
