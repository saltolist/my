"use client";

import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { IconButton } from "@/shared/ui/icon-button";

type TelegramCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  onDismiss: () => void;
};

export function TelegramCodeInput({ value, onChange, onDismiss }: TelegramCodeInputProps) {
  return (
    <div className="relative flex items-center">
      <Input
        className="pr-10"
        placeholder="Код из Telegram"
        maxLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <IconButton
        type="button"
        className="absolute right-1"
        aria-label="Отменить ввод кода"
        onClick={onDismiss}
      >
        <X className="size-3.5" />
      </IconButton>
    </div>
  );
}
