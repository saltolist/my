"use client";

import { Send } from "lucide-react";

import { Button } from "@/shared/ui/button";

type SendButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <Button
      size="icon-sm"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Отправить"
    >
      <Send className="size-4" />
    </Button>
  );
}
