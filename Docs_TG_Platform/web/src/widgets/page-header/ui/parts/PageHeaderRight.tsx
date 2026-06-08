"use client";

import PageHeaderOverflow, { type PageHeaderOverflowItem } from "@/widgets/page-header/ui/PageHeaderOverflow";
import { PageHeaderSearchMagnifier } from "@/widgets/page-header/ui/PageHeaderSearchInput";
import type { ReactNode, Ref, RefObject } from "react";

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
  overflowWrapRef?: Ref<HTMLDivElement>;
  headerRightRef?: Ref<HTMLDivElement>;
  searchToggleAnchorRef?: Ref<HTMLElement>;
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
  overflowWrapRef,
  headerRightRef,
  searchToggleAnchorRef,
  hasTrailingToolbar,
}: Props) {
  if (isMobile && !showMobileRight) return null;

  return (
    <div
      ref={headerRightRef}
      className={`page-header-right${showMobileRight || compactSearch ? " page-header-right--mobile" : ""}`}
    >
      {!isMobile ? (
        <div className="page-header-actions--desktop">
          {compactSearch && showSearchToggle ? (
            mobileSearchOpen ? (
              <span
                ref={searchToggleAnchorRef}
                className="page-header-search-toggle-slot"
                aria-hidden
              />
            ) : (
              <button
                ref={searchToggleAnchorRef as Ref<HTMLButtonElement>}
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
            <div ref={overflowWrapRef}>
              <PageHeaderOverflow items={overflowItems} />
            </div>
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
            <div ref={overflowWrapRef}>
              <PageHeaderOverflow className="page-header-actions--mobile" items={overflowItems} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
