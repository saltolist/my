"use client";

import { useUiStore } from "@/app/model/store";
import { cn } from "@/shared/lib/utils";
import { FeedCardWidthToggle } from "@/shared/ui/feed-card-width-toggle";
import { SearchField } from "@/shared/ui/search-field";

export type FeedHeaderToolbarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FeedHeaderToolbar({ value, onChange, className }: FeedHeaderToolbarProps) {
  const feedCardWidth = useUiStore((s) => s.feedCardWidth);
  const setFeedCardWidth = useUiStore((s) => s.setFeedCardWidth);

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      <SearchField
        placeholder="Поиск по постам…"
        value={value}
        onChange={onChange}
        aria-label="Поиск по постам"
        className="w-44 sm:w-52"
      />
      <FeedCardWidthToggle value={feedCardWidth} onChange={setFeedCardWidth} />
    </div>
  );
}
