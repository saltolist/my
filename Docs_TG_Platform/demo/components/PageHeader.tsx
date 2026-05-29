"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useApp } from "@/state/AppContext";
import type { ScreenId } from "@/lib/types";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import PageHeaderMenuButton from "./PageHeaderMenuButton";
import PageHeaderOverflow, { type PageHeaderOverflowItem } from "./PageHeaderOverflow";
import PageHeaderSearchInput, { PageHeaderSearchMagnifier } from "./PageHeaderSearchInput";

type Props = {
  title?: ReactNode;
  left?: ReactNode;
  backTo?: ScreenId;
  onBack?: () => void;
  backLabel?: string;
  /** Контент области поиска (desktop). На мобильной раскрывается по нажатию на иконку. */
  search?: ReactNode;
  /** Центр шапки на desktop (вкладки, периоды и т.п.) — без мобильного поиска. */
  center?: ReactNode;
  /** Селектор вкладок: на мобильной — у правого края; на desktop — слева от «← Назад» */
  mobileSelect?: ReactNode;
  actions?: ReactNode;
  /** На мобильной — одно меню вместо ряда кнопок в `actions` */
  overflowItems?: PageHeaderOverflowItem[];
};

type ElementWithChildren = { children?: ReactNode };

function withMobileSearchClose(node: ReactNode, onClose: () => void): ReactNode {
  if (!isValidElement<ElementWithChildren>(node)) return node;
  if (node.type === PageHeaderSearchInput) {
    return cloneElement(node, { onDismiss: onClose } as never);
  }
  if (node.props.children != null) {
    const children = Children.map(node.props.children, (child) => withMobileSearchClose(child, onClose));
    return cloneElement(node, {}, children);
  }
  return node;
}

function findPageHeaderSearchInput(node: ReactNode): ReactNode | null {
  if (!isValidElement<ElementWithChildren>(node)) return null;
  if (node.type === PageHeaderSearchInput) return node;
  if (node.props.children == null) return null;
  for (const child of Children.toArray(node.props.children)) {
    const found = findPageHeaderSearchInput(child);
    if (found) return found;
  }
  return null;
}

export default function PageHeader({
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
}: Props) {
  const { navigateBack } = useApp();
  const handleBack = onBack ?? (backTo ? () => navigateBack(backTo) : undefined);
  const isMobile = useMobile760();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileSearchLeftRef = useRef<HTMLDivElement>(null);
  const mobileSelectWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setMobileSearchOpen(false);
    }
  }, [isMobile]);

  useLayoutEffect(() => {
    if (!mobileSearchOpen || !isMobile) return;
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
  }, [mobileSearchOpen, isMobile]);

  useLayoutEffect(() => {
    if (!mobileSearchOpen || !isMobile || !mobileSelect) return;
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
  }, [mobileSearchOpen, isMobile, mobileSelect]);

  const showMobileSearchToggle = isMobile && !!search;
  const mobileSearchInput = search ? findPageHeaderSearchInput(search) : null;
  const mobileSearchContent =
    isMobile && mobileSearchOpen && mobileSearchInput
      ? withMobileSearchClose(mobileSearchInput, () => setMobileSearchOpen(false))
      : null;

  const hasMobileTrailing =
    !!mobileSelect || (overflowItems != null && overflowItems.length > 0);
  const showMobileRight =
    isMobile &&
    ((showMobileSearchToggle && !mobileSearchOpen) ||
      hasMobileTrailing ||
      (mobileSearchOpen && hasMobileTrailing));

  const trailingDesktopSelect = !isMobile && !!mobileSelect;

  return (
    <div
      ref={headerRef}
      className={`page-header${mobileSearchOpen ? " page-header--search-open" : ""}${
        mobileSearchOpen && mobileSelect ? " page-header--has-mobile-select" : ""
      }${trailingDesktopSelect ? " page-header--trailing-select" : ""}`}
    >
      <div className="page-header-left" ref={mobileSearchLeftRef}>
        <PageHeaderMenuButton />
        {!mobileSearchOpen && (title ? <h2>{title}</h2> : null)}
        {!mobileSearchOpen && left}
      </div>
      {isMobile && mobileSearchOpen && mobileSearchContent ? (
        <>
          <div className="page-header-search-expand" ref={mobileSearchWrapRef}>
            {mobileSearchContent}
          </div>
          <div className="page-header-search-spacer" aria-hidden />
        </>
      ) : (
        <div className="page-header-center" aria-hidden={isMobile ? true : undefined}>
          {center && !isMobile ? center : null}
          {search && !isMobile ? search : null}
        </div>
      )}
      {!isMobile || showMobileRight ? (
      <div
        className={`page-header-right${showMobileRight ? " page-header-right--mobile" : ""}`}
      >
        {!isMobile ? (
          <div className="page-header-actions--desktop">
            {mobileSelect ? (
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
          </div>
        ) : null}
        {showMobileRight ? (
          <>
            {showMobileSearchToggle ? (
              mobileSearchOpen ? (
                hasMobileTrailing ? (
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
                ref={mobileSelectWrapRef}
                className="page-header-toolbar-slot page-header-toolbar--mobile"
              >
                {mobileSelect}
              </div>
            ) : null}
            {overflowItems && overflowItems.length > 0 ? (
              <PageHeaderOverflow
                className="page-header-actions--mobile"
                items={overflowItems}
              />
            ) : null}
          </>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
