"use client";

import type { RefObject } from "react";
import {
  PageHeaderOverflow,
  PageHeaderSearchMagnifier,
  type PageHeaderOverflowItem,
} from "@/widgets/page-header";

type Props = {
  showListHeaderSearch: boolean;
  mobileSearchOpen: boolean;
  hasPostMobileTrailing: boolean;
  listSearchPlaceholder: string;
  postHeaderOverflowItems: PageHeaderOverflowItem[];
  postOverflowWrapRef: RefObject<HTMLDivElement | null>;
  onToggleMobileSearch: () => void;
};

export default function PostScreenHeaderMobileActions({
  showListHeaderSearch,
  mobileSearchOpen,
  hasPostMobileTrailing,
  listSearchPlaceholder,
  postHeaderOverflowItems,
  postOverflowWrapRef,
  onToggleMobileSearch,
}: Props) {
  return (
    <>
      {showListHeaderSearch ? (
        mobileSearchOpen ? (
          hasPostMobileTrailing ? (
            <span className="page-header-search-toggle-slot" aria-hidden />
          ) : null
        ) : (
          <button
            type="button"
            className={`post-header-search-toggle${mobileSearchOpen ? " is-active" : ""}`}
            aria-label={listSearchPlaceholder}
            aria-expanded={mobileSearchOpen}
            onClick={onToggleMobileSearch}
          >
            <PageHeaderSearchMagnifier size={20} />
          </button>
        )
      ) : null}
      {hasPostMobileTrailing ? (
        <div ref={postOverflowWrapRef}>
          <PageHeaderOverflow
            className="page-header-actions--mobile"
            items={postHeaderOverflowItems}
          />
        </div>
      ) : null}
    </>
  );
}
