"use client";

import type { ReactNode } from "react";

import {
  FEED_POST_WIDTHS,
  FEED_POST_WIDTH_SELECT_OPTIONS,
  feedPostWidthLabel,
  isFeedPostWidth,
  type FeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import { PageHeaderSearchInput, PageHeaderSelect } from "@/widgets/page-header";

export type FeedHeaderSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
  feedPostWidth: FeedPostWidth;
  onFeedPostWidthChange: (width: FeedPostWidth) => void;
  onSearchClose?: () => void;
  dismissAlways?: boolean;
};

/** Статическое JSX-дерево для PageHeader.search (нужно для expandable-поиска по лупе). */
export function createFeedHeaderSearchRow({
  value,
  onChange,
  feedPostWidth,
  onFeedPostWidthChange,
  onSearchClose,
  dismissAlways = false,
}: FeedHeaderSearchRowProps): ReactNode {
  const showDismissAlways = dismissAlways || !!onSearchClose;

  return (
    <div className="page-header-search-tools-row page-header-feed-search-row">
      <PageHeaderSearchInput
        placeholder="Поиск по постам..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDismiss={onSearchClose ?? (() => onChange(""))}
        dismissAlways={showDismissAlways}
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
            onClick={() => onFeedPostWidthChange(w)}
          >
            {feedPostWidthLabel(w)}
          </button>
        ))}
      </div>
      <div className="page-header-feed-width-select feed-post-width-select--compact page-header-toolbar--desktop">
        <PageHeaderSelect
          ariaLabel="Ширина карточки поста в ленте"
          value={String(feedPostWidth)}
          options={FEED_POST_WIDTH_SELECT_OPTIONS}
          onChange={(v) => {
            const n = Number(v);
            if (isFeedPostWidth(n)) onFeedPostWidthChange(n);
          }}
        />
      </div>
    </div>
  );
}
