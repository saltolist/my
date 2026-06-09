"use client";

import { useMemo } from "react";

import { useUiStore } from "@/app/model/store";
import {
  FEED_POST_WIDTHS,
  FEED_POST_WIDTH_SELECT_OPTIONS,
  feedPostWidthLabel,
  isFeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import { PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";

export type FeedHeaderToolbarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function FeedHeaderToolbar({ value, onChange }: FeedHeaderToolbarProps) {
  const feedPostWidth = useUiStore((s) => s.feedCardWidth);
  const setFeedPostWidth = useUiStore((s) => s.setFeedCardWidth);

  const feedPostWidthSelectProps = useMemo(
    () => ({
      ariaLabel: "Ширина карточки поста в ленте",
      value: String(feedPostWidth),
      options: FEED_POST_WIDTH_SELECT_OPTIONS,
      onChange: (v: string) => {
        const n = Number(v);
        if (isFeedPostWidth(n)) setFeedPostWidth(n);
      },
    }),
    [feedPostWidth, setFeedPostWidth],
  );

  return (
    <div className="page-header-search-tools-row page-header-feed-search-row">
      <PageHeaderSearchInput
        placeholder="Поиск по постам..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDismiss={() => onChange("")}
      />
      <div
        className="feed-post-width-toggles feed-post-width-toggles--tabs page-header-toolbar--desktop"
        role="group"
        aria-label="Ширина карточки поста в ленте"
      >
        {FEED_POST_WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            className={`feed-post-width-btn${feedPostWidth === w ? " active" : ""}`}
            onClick={() => setFeedPostWidth(w)}
          >
            {feedPostWidthLabel(w)}
          </button>
        ))}
      </div>
      <div className="page-header-feed-width-select feed-post-width-select--compact page-header-toolbar--desktop">
        <PageHeaderSelect {...feedPostWidthSelectProps} />
      </div>
    </div>
  );
}
