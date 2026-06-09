"use client";

import {
  formatTelegramPhoneInput,
  TELEGRAM_PHONE_FORMATTED_MAX_LENGTH,
} from "@/shared/lib/format-telegram-phone";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type TelegramPhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
};

export function TelegramPhoneInput({
  value,
  onChange,
  className,
  readOnly = false,
}: TelegramPhoneInputProps) {
  return (
    <Input
      className={cn(className)}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      maxLength={TELEGRAM_PHONE_FORMATTED_MAX_LENGTH}
      placeholder="+7 999 000-00-00"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(formatTelegramPhoneInput(e.target.value))}
    />
  );
}
