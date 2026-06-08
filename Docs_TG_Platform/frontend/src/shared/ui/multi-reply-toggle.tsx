"use client";

import { cn } from "@/shared/lib/utils";
import { Switch } from "@/shared/ui/switch";

type MultiReplyToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function MultiReplyToggle({ checked, onCheckedChange, className }: MultiReplyToggleProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label="Мультиответ" />
      <span>Мультиответ</span>
    </label>
  );
}
