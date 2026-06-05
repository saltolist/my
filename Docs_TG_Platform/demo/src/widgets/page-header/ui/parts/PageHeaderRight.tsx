"use client";

import PageHeaderOverflow, { type PageHeaderOverflowItem } from "@/widgets/page-header/ui/PageHeaderOverflow";
import { PageHeaderSearchMagnifier } from "@/widgets/page-header/ui/PageHeaderSearchInput";
import type { ReactNode, RefObject } from "react";

type Props = {
  isMobile: boolean;
  showMobileRight: boolean;
  compactSearch: boolean;
  showSearchToggle: boolean;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  showCompactToolbarSelect: boolean;
  trailingDesktopSelect: boolean;
  mobileSelect?: ReactNode;
  mobileSelectWrapRef: RefObject<HTMLDivElement | null>;
  handleBack?: () => void;
  backLabel: string;
  actions?: ReactNode;
  overflowItems?: PageHeaderOverflowItem[];
  hasTrailingToolbar: boolean;
};

export default function PageHeaderRight({
  isMobile,
  showMobileRight,
  compactSearch,
  showSearchToggle,
  mobileSearchOpen,
  setMobileSearchOpen,
  showCompactToolbarSelect,
  trailingDesktopSelect,
  mobileSelect,
  mobileSelectWrapRef,
  handleBack,
  backLabel,
  actions,
  overflowItems,
  hasTrailingToolbar,
}: Props) {
  if (isMobile && !showMobileRight) return null;

  return (
    <div
      className={`page-header-right${showMobileRight || compactSearch ? " page-header-right--mobile" : ""}`}
    >
      {!isMobile ? (
        <div className="page-header-actions--desktop">
          {compactSearch && showSearchToggle && !mobileSearchOpen ? (
            <button
              type="button"
              className="page-header-search-toggle"
              aria-label="Поиск"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen(true)}
            >
              <PageHeaderSearchMagnifier size={20} />
            </button>
          ) : null}
          {showCompactToolbarSelect ? (
            <div
              ref={mobileSelectWrapRef}
              className="page-header-toolbar-slot page-header-toolbar--desktop-select"
            >
              {mobileSelect}
            </div>
          ) : null}
          {trailingDesktopSelect && mobileSelect ? (
            <div className="page-header-toolbar-slot page-header-toolbar--desktop-select">
              {mobileSelect}
            </div>
          ) : null}
          {handleBack ? (
            <button
              className="btn btn-ghost btn-sm page-header-back-btn"
              onClick={handleBack}
              type="button"
            >
              {backLabel}
            </button>
          ) : null}
          {actions}
          {overflowItems && overflowItems.length > 0 ? (
            <PageHeaderOverflow items={overflowItems} />
          ) : null}
        </div>
      ) : null}
      {showMobileRight ? (
        <>
          {showSearchToggle ? (
            mobileSearchOpen ? (
              hasTrailingToolbar ? (
                <span className="page-header-search-toggle-slot" aria-hidden />
              ) : null
            ) : (
              <button
                type="button"
                className="page-header-search-toggle"
                aria-label="Поиск"
                aria-expanded={mobileSearchOpen}
                onClick={() => setMobileSearchOpen(true)}
              >
                <PageHeaderSearchMagnifier size={20} />
              </button>
            )
          ) : null}
          {mobileSelect ? (
            <div
              ref={isMobile ? mobileSelectWrapRef : undefined}
              className="page-header-toolbar-slot page-header-toolbar--mobile"
            >
              {mobileSelect}
            </div>
          ) : null}
          {overflowItems && overflowItems.length > 0 ? (
            <PageHeaderOverflow className="page-header-actions--mobile" items={overflowItems} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
