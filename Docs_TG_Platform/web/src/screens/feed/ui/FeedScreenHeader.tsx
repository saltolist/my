"use client";

import PageHeader from "@/widgets/page-header/ui/PageHeader";
import PageHeaderSearchInput from "@/widgets/page-header/ui/PageHeaderSearchInput";
import PageHeaderSelect from "@/widgets/page-header/ui/PageHeaderSelect";
import { FEED_POST_WIDTHS, feedPostWidthLabel } from "@/shared/lib/feedPostWidth";
import type { FeedScreenState } from "@/screens/feed/model/useFeedScreen";

type Props = Pick<
  FeedScreenState,
  "search" | "setSearch" | "feedPostWidth" | "setFeedPostWidth" | "feedPostWidthSelectProps"
>;

export default function FeedScreenHeader({
  search,
  setSearch,
  feedPostWidth,
  setFeedPostWidth,
  feedPostWidthSelectProps,
}: Props) {
  return (
    <PageHeader
      title="Лента"
      backTo="home"
      compactSearchAtWidth={804}
      search={
        <div className="page-header-search-tools-row page-header-feed-search-row">
          <PageHeaderSearchInput
            placeholder="Поиск по постам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onDismiss={() => setSearch("")}
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
      }
    />
  );
}
