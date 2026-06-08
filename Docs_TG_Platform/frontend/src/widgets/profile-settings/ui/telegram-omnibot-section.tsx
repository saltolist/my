"use client";

import { BotIcon } from "lucide-react";

import { useTelegramProfile } from "@/entities/channel/model/useProfile";
import type { TelegramBotStatus } from "@/shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PasswordToggle } from "@/shared/ui/password-toggle";
import { Label } from "@/shared/ui/label";

const botStatusLabel: Record<TelegramBotStatus, string> = {
  idle: "Не подключён",
  connected: "Подключён",
};

export function TelegramOmnibotSection() {
  const { data: telegramProfile } = useTelegramProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotIcon className="size-4" />
          Omnibot
        </CardTitle>
        <CardDescription>Bot API и активность бота</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Bot API Token</Label>
          <PasswordToggle readOnly value={telegramProfile?.botApiToken ?? "—"} />
        </div>
        <div className="grid gap-1.5">
          <Label>Статус бота</Label>
          <Input
            readOnly
            value={botStatusLabel[telegramProfile?.botStatus ?? "idle"] ?? "—"}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Username</Label>
          <Input readOnly value={telegramProfile?.botUsername || "—"} />
        </div>
        <div className="grid gap-1.5">
          <Label>Последняя активность</Label>
          <Input readOnly value={telegramProfile?.botLastActivity ?? "—"} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Сообщений обработано</Label>
          <Input readOnly value={String(telegramProfile?.botMessageCount ?? 0)} />
        </div>
      </CardContent>
    </Card>
  );
}
