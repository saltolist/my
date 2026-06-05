"use client";

import type { ReactNode, RefObject } from "react";

type Props = {
  mobileOverlaySearch: boolean;
  compactSearch: boolean;
  mobileSearchOpen: boolean;
  expandableSearchContent: ReactNode | null;
  mobileSearchWrapRef: RefObject<HTMLDivElement | null>;
  center?: ReactNode;
  search?: ReactNode;
};

export default function PageHeaderCenter({
  mobileOverlaySearch,
  compactSearch,
  mobileSearchOpen,
  expandableSearchContent,
  mobileSearchWrapRef,
  center,
  search,
}: Props) {
  if (mobileOverlaySearch && mobileSearchOpen && expandableSearchContent) {
    return (
      <>
        <div className="page-header-search-expand" ref={mobileSearchWrapRef}>
          {expandableSearchContent}
        </div>
        <div className="page-header-search-spacer" aria-hidden />
      </>
    );
  }

  if (compactSearch && mobileSearchOpen && expandableSearchContent) {
    return (
      <div
        className="page-header-center page-header-compact-search-field"
        ref={mobileSearchWrapRef}
      >
        {expandableSearchContent}
      </div>
    );
  }

  return (
    <div className="page-header-center" aria-hidden={mobileOverlaySearch ? true : undefined}>
      {center && !mobileOverlaySearch && !compactSearch ? center : null}
      {search && !mobileOverlaySearch && !compactSearch ? search : null}
    </div>
  );
}
