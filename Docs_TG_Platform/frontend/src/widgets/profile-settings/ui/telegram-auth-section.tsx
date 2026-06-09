"use client";

import { useState } from "react";
import { SmartphoneIcon } from "lucide-react";

import { useTelegramProfile } from "@/entities/channel/model/useProfile";
import type { TelegramAuthStatus } from "@/shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PasswordToggle } from "@/shared/ui/password-toggle";
import { Label } from "@/shared/ui/label";
import { TelegramCodeInput } from "@/widgets/profile-settings/ui/telegram-code-input";
import { TelegramPhoneInput } from "@/widgets/profile-settings/ui/telegram-phone-input";
import { TelegramResendCode } from "@/widgets/profile-settings/ui/telegram-resend-code";

const authStatusLabel: Record<TelegramAuthStatus, string> = {
  idle: "Не подключено",
  "code-sent": "Код отправлен",
  authorized: "Авторизован",
  connected: "Подключено",
};

export function TelegramAuthSection() {
  const { data: telegramProfile } = useTelegramProfile();
  const phone = telegramProfile?.phone ?? "";
  const authStatus = telegramProfile?.authStatus ?? "idle";
  const [code, setCode] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SmartphoneIcon className="size-4" />
          Telegram MTProto
        </CardTitle>
        <CardDescription>Только просмотр — без реального подключения</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Статус авторизации</Label>
            <Input
              readOnly
              value={authStatusLabel[telegramProfile?.authStatus ?? "idle"] ?? "—"}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Телефон</Label>
            {phone ? (
              <TelegramPhoneInput readOnly value={phone} onChange={() => undefined} />
            ) : (
              <Input readOnly value="—" />
            )}
          </div>
          {authStatus === "code-sent" ? (
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Код подтверждения</Label>
              <TelegramCodeInput value={code} onChange={setCode} onDismiss={() => setCode("")} />
              <TelegramResendCode secondsLeft={42} onResend={() => undefined} />
            </div>
          ) : null}
          <div className="grid gap-1.5">
            <Label>API ID</Label>
            <Input readOnly value={telegramProfile?.apiId ?? "—"} />
          </div>
          <div className="grid gap-1.5">
            <Label>API Hash</Label>
            <PasswordToggle readOnly value={telegramProfile?.apiHash ?? "—"} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Сессия</Label>
            <Input readOnly value={telegramProfile?.sessionName ?? "—"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
