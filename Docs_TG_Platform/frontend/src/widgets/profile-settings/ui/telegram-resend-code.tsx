"use client";

import { Button } from "@/shared/ui/button";

function formatResendTimer(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type TelegramResendCodeProps = {
  secondsLeft: number;
  onResend: () => void;
};

export function TelegramResendCode({ secondsLeft, onResend }: TelegramResendCodeProps) {
  if (secondsLeft > 0) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Отправить код повторно ({formatResendTimer(secondsLeft)})
      </p>
    );
  }

  return (
    <Button type="button" variant="link" className="h-auto p-0" onClick={onResend}>
      Отправить код повторно
    </Button>
  );
}
