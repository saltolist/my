"use client";

import { cn } from "@/shared/lib/utils";
import type { FeedCardWidth } from "@/shared/types";
import { Button } from "@/shared/ui/button";

const WIDTHS: FeedCardWidth[] = [500, 390, 270];

type FeedCardWidthToggleProps = {
  value: FeedCardWidth;
  onChange: (width: FeedCardWidth) => void;
  className?: string;
};

export function FeedCardWidthToggle({ value, onChange, className }: FeedCardWidthToggleProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label="Ширина карточки">
      {WIDTHS.map((width) => (
        <Button
          key={width}
          type="button"
          size="xs"
          variant={value === width ? "secondary" : "ghost"}
          onClick={() => onChange(width)}
          aria-pressed={value === width}
        >
          {width}
        </Button>
      ))}
    </div>
  );
}
