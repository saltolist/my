"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { PageHeaderOverflowItem } from "@/widgets/page-header/ui/PageHeaderOverflow";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import {
  findPageHeaderSearchInput,
  withMobileSearchClose,
} from "@/widgets/page-header/lib/pageHeaderSearchUtils";
import {
  PROFILE_HEADER_CHANNEL_SUMMARY_COMPACT_MAX,
  PROFILE_HEADER_CHANNEL_SUMMARY_TWO_ROW_MAX,
  PROFILE_HEADER_CHART_MAX_POINTS_MAX,
  PROFILE_HEADER_CHART_NARROW_MAX,
  PROFILE_HEADER_CHART_SHORT_MAX,
  PROFILE_HEADER_PLATFORM_PERIOD_MAX,
  PROFILE_HEADER_TOP_POSTS_COMPACT_MAX,
  syncProfileHeaderTrashCompactToDocument,
} from "@/shared/lib/profileBreakpoints";
import { useNavigation } from "@/app/model/store";
import type { ScreenId } from "@/shared/types";

export type PageHeaderProps = {
  title?: ReactNode;
  left?: ReactNode;
  backTo?: ScreenId;
  onBack?: () => void;
  backLabel?: string;
  search?: ReactNode;
  center?: ReactNode;
  mobileSelect?: ReactNode;
  actions?: ReactNode;
  overflowItems?: PageHeaderOverflowItem[];
  compactSearchAtWidth?: number;
};

export function usePageHeader({
  title,
  left,
  backTo,
  onBack,
  backLabel = "← Назад",
  search,
  center,
  mobileSelect,
  actions,
  overflowItems,
  compactSearchAtWidth,
}: PageHeaderProps) {
  const { navigateBack } = useNavigation();
  const handleBack = onBack ?? (backTo ? () => navigateBack(backTo) : undefined);
  const isMobile = useMobile760();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerWidth, setHeaderWidth] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileSearchLeftRef = useRef<HTMLDivElement>(null);
  const mobileSelectWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const compactSearch =
    !isMobile &&
    compactSearchAtWidth != null &&
    headerWidth > 0 &&
    headerWidth <= compactSearchAtWidth;
  const mobileOverlaySearch = isMobile;

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (compactSearchAtWidth != null) {
        setHeaderWidth(w);
      }
      document.documentElement.style.setProperty("--page-header-w", `${w}px`);
      document.documentElement.style.setProperty("--page-header-w-num", String(w));
      syncProfileHeaderTrashCompactToDocument(w, isMobile);
      document.documentElement.toggleAttribute("data-page-header-le-841", !isMobile && w > 0 && w <= 841);
      document.documentElement.toggleAttribute(
        "data-page-header-le-780",
        !isMobile && w > 0 && w <= PROFILE_HEADER_TOP_POSTS_COMPACT_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-1080",
        !isMobile && w > 0 && w <= PROFILE_HEADER_CHART_MAX_POINTS_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-640",
        !isMobile && w > 0 && w <= PROFILE_HEADER_CHART_NARROW_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-1130",
        !isMobile && w > 0 && w <= PROFILE_HEADER_CHANNEL_SUMMARY_COMPACT_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-804",
        !isMobile && w > 0 && w <= PROFILE_HEADER_CHART_SHORT_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-930",
        !isMobile && w > 0 && w <= PROFILE_HEADER_CHANNEL_SUMMARY_TWO_ROW_MAX,
      );
      document.documentElement.toggleAttribute(
        "data-page-header-le-650",
        !isMobile && w > 0 && w <= PROFILE_HEADER_PLATFORM_PERIOD_MAX,
      );
    };
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    sync();
    return () => {
      observer.disconnect();
      if (compactSearchAtWidth != null) {
        setHeaderWidth(0);
      }
      document.documentElement.removeAttribute("data-profile-header-trash-compact");
      document.documentElement.removeAttribute("data-page-header-le-841");
      document.documentElement.removeAttribute("data-page-header-le-780");
      document.documentElement.removeAttribute("data-page-header-le-1080");
      document.documentElement.removeAttribute("data-page-header-le-640");
      document.documentElement.removeAttribute("data-page-header-le-1130");
      document.documentElement.removeAttribute("data-page-header-le-804");
      document.documentElement.removeAttribute("data-page-header-le-930");
      document.documentElement.removeAttribute("data-page-header-le-650");
      document.documentElement.style.removeProperty("--page-header-w");
      document.documentElement.style.removeProperty("--page-header-w-num");
    };
  }, [compactSearchAtWidth, isMobile]);

  useEffect(() => {
    if (!mobileOverlaySearch && !compactSearch) {
      setMobileSearchOpen(false);
    }
  }, [mobileOverlaySearch, compactSearch]);

  useLayoutEffect(() => {
    if (!mobileSearchOpen || (!mobileOverlaySearch && !compactSearch)) return;
    const wrap = mobileSearchWrapRef.current;
    if (!wrap) return;
    const input = wrap.querySelector<HTMLInputElement>("input, textarea");
    mobileSearchInputRef.current = input;
    input?.focus();
    if (input && "setSelectionRange" in input) {
      try {
        const len = input.value?.length ?? 0;
        input.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }
  }, [mobileSearchOpen, mobileOverlaySearch, compactSearch]);

  useLayoutEffect(() => {
    if (!mobileSearchOpen || !mobileOverlaySearch || !mobileSelect) return;
    const header = headerRef.current;
    const left = mobileSearchLeftRef.current;
    const selectWrap = mobileSelectWrapRef.current;
    if (!header || !left || !selectWrap) return;

    const updateSearchSpan = () => {
      const headerRect = header.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      const selectRect = selectWrap.getBoundingClientRect();
      header.style.setProperty(
        "--page-header-search-span-left",
        `${leftRect.right - headerRect.left}px`,
      );
      header.style.setProperty(
        "--page-header-search-span-right",
        `${headerRect.right - selectRect.left}px`,
      );
    };

    updateSearchSpan();
    const observer = new ResizeObserver(updateSearchSpan);
    observer.observe(header);
    observer.observe(left);
    observer.observe(selectWrap);
    window.addEventListener("resize", updateSearchSpan);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSearchSpan);
    };
  }, [mobileSearchOpen, mobileOverlaySearch, mobileSelect]);

  const showSearchToggle = (mobileOverlaySearch || compactSearch) && !!search;
  const mobileSearchInput = search ? findPageHeaderSearchInput(search) : null;
  const expandableSearchContent =
    mobileSearchOpen && mobileSearchInput
      ? withMobileSearchClose(mobileSearchInput, () => setMobileSearchOpen(false))
      : null;

  const hasTrailingToolbar =
    !!mobileSelect || (overflowItems != null && overflowItems.length > 0);
  const showMobileRight =
    isMobile &&
    ((showSearchToggle && !mobileSearchOpen) ||
      hasTrailingToolbar ||
      (mobileSearchOpen && hasTrailingToolbar));

  const trailingDesktopSelect =
    !isMobile && !!mobileSelect && compactSearchAtWidth == null;
  const showCompactToolbarSelect = compactSearch && !!mobileSelect;

  const headerClassName = [
    "page-header",
    mobileSearchOpen ? "page-header--search-open" : "",
    mobileSearchOpen && mobileSelect && mobileOverlaySearch ? "page-header--has-mobile-select" : "",
    trailingDesktopSelect ? "page-header--trailing-select" : "",
    compactSearch ? "page-header--compact-search" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    left,
    backLabel,
    search,
    center,
    mobileSelect,
    actions,
    overflowItems,
    headerRef,
    mobileSearchLeftRef,
    mobileSelectWrapRef,
    mobileSearchWrapRef,
    headerClassName,
    isMobile,
    mobileSearchOpen,
    setMobileSearchOpen,
    compactSearch,
    mobileOverlaySearch,
    showSearchToggle,
    expandableSearchContent,
    hasTrailingToolbar,
    showMobileRight,
    trailingDesktopSelect,
    showCompactToolbarSelect,
    handleBack,
  };
}
