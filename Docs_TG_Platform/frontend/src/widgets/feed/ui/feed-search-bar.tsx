"use client";

import { useUiStore } from "@/app/model/store/ui-store";
import { cn } from "@/shared/lib/utils";
import { FeedCardWidthToggle } from "@/shared/ui/feed-card-width-toggle";
import { SearchField } from "@/shared/ui/search-field";

export type FeedSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FeedSearchBar({ value, onChange, className }: FeedSearchBarProps) {
  const feedCardWidth = useUiStore((s) => s.feedCardWidth);
  const setFeedCardWidth = useUiStore((s) => s.setFeedCardWidth);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SearchField
        placeholder="Поиск по постам…"
        value={value}
        onChange={onChange}
        aria-label="Поиск по постам"
        className="w-48 sm:w-56"
      />
      <FeedCardWidthToggle value={feedCardWidth} onChange={setFeedCardWidth} />
    </div>
  );
}
