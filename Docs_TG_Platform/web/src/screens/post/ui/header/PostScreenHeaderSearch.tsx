"use client";

import type { RefObject } from "react";
import PageHeaderSearchInput from "@/widgets/page-header/ui/PageHeaderSearchInput";

type Props = {
  postHeaderCompact: boolean;
  mobileSearchOpen: boolean;
  showListHeaderSearch: boolean;
  listSearchPlaceholder: string;
  listSearch: string;
  setListSearch: (value: string) => void;
  setMobileSearchOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  mobileSearchWrapRef: RefObject<HTMLDivElement | null>;
  mobileSearchInputRef: RefObject<HTMLInputElement | null>;
};

export default function PostScreenHeaderSearch({
  postHeaderCompact,
  mobileSearchOpen,
  showListHeaderSearch,
  listSearchPlaceholder,
  listSearch,
  setListSearch,
  setMobileSearchOpen,
  mobileSearchWrapRef,
  mobileSearchInputRef,
}: Props) {
  if (!showListHeaderSearch) return null;

  if (postHeaderCompact && mobileSearchOpen) {
    return (
      <>
        <div className="post-header-search-expand" ref={mobileSearchWrapRef}>
          <PageHeaderSearchInput
            autoFocus
            placeholder={listSearchPlaceholder}
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            aria-label={listSearchPlaceholder}
            inputRef={mobileSearchInputRef}
            onDismiss={() => setMobileSearchOpen(false)}
            dismissAlways
          />
        </div>
        <div className="page-header-search-spacer" aria-hidden />
      </>
    );
  }

  if (!postHeaderCompact) {
    return (
      <div className="page-header-center">
        <div className="post-header-search-row">
          <PageHeaderSearchInput
            placeholder={listSearchPlaceholder}
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            onDismiss={() => setListSearch("")}
          />
        </div>
      </div>
    );
  }

  return null;
}
