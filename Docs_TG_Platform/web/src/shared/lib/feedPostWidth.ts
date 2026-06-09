export const FEED_POST_WIDTHS = [500, 390, 270] as const;
export type FeedPostWidth = (typeof FEED_POST_WIDTHS)[number];

/** @deprecated Use FeedPostWidth — alias for ui-store / legacy naming */
export type FeedCardWidth = FeedPostWidth;

export function isFeedPostWidth(value: number): value is FeedPostWidth {
  return (FEED_POST_WIDTHS as readonly number[]).includes(value);
}

export function feedPostWidthLabel(width: FeedPostWidth): string {
  return width === 500 ? "Компьютер" : width === 390 ? "Планшет" : "Телефон";
}

export const FEED_POST_WIDTH_SELECT_OPTIONS = FEED_POST_WIDTHS.map((w) => ({
  value: String(w),
  label: feedPostWidthLabel(w),
}));
