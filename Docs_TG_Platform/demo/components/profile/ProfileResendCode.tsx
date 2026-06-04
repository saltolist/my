"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const PROFILE_RESEND_COOLDOWN_SECONDS = 60;

export function formatProfileResendTimer(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function useProfileResendCooldown(active: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const clearCooldown = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(0);
  }, []);

  const beginCooldown = useCallback(() => {
    clearCooldown();
    setSecondsLeft(PROFILE_RESEND_COOLDOWN_SECONDS);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCooldown]);

  useEffect(() => {
    if (active) beginCooldown();
    else clearCooldown();
    return () => clearCooldown();
  }, [active, beginCooldown, clearCooldown]);

  const resend = useCallback(() => {
    if (secondsLeft > 0) return;
    beginCooldown();
  }, [secondsLeft, beginCooldown]);

  return { secondsLeft, beginCooldown, clearCooldown, resend };
}

export default function ProfileResendCode({
  secondsLeft,
  onResend,
}: {
  secondsLeft: number;
  onResend: () => void;
}) {
  if (secondsLeft > 0) {
    return (
      <p className="telegram-resend-code" aria-live="polite">
        Отправить код повторно ({formatProfileResendTimer(secondsLeft)})
      </p>
    );
  }

  return (
    <button
      className="telegram-resend-code telegram-resend-code--ready"
      onClick={onResend}
      type="button"
    >
      Отправить код повторно
    </button>
  );
}
