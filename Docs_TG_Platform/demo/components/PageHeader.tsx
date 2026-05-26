"use client";

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/state/AppContext";
import type { ScreenId } from "@/lib/types";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { useMobileHeaderSearchDismiss } from "@/lib/hooks/useMobileHeaderSearchDismiss";
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
  /** На мобильной — селектор вкладок у правого края шапки */
  mobileSelect?: ReactNode;
  actions?: ReactNode;
  /** На мобильной — одно меню вместо ряда кнопок в `actions` */
  overflowItems?: PageHeaderOverflowItem[];
};

function withMobileSearchClose(node: ReactNode, onClose: () => void): ReactNode {
  if (!isValidElement(node)) return node;
  if (node.type === PageHeaderSearchInput) {
    return cloneElement(node, { onDismiss: onClose } as never);
  }
  if (node.props.children != null) {
    const children = Children.map(node.props.children, (child) => withMobileSearchClose(child, onClose));
    return cloneElement(node, {}, children);
  }
  return node;
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
    // Важно: фокус сразу при появлении поля
    input?.focus();
    // Поставить курсор в конец для удобства редактирования
    if (input && "setSelectionRange" in input) {
      try {
        const len = input.value?.length ?? 0;
        input.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }
  }, [mobileSearchOpen, isMobile]);

  useMobileHeaderSearchDismiss({
    open: mobileSearchOpen,
    isMobile,
    wrapRef: mobileSearchWrapRef,
    inputRef: mobileSearchInputRef,
    onClose: () => setMobileSearchOpen(false),
  });

  const showMobileSearchToggle = isMobile && !!search;
  const mobileSearchContent =
    isMobile && mobileSearchOpen && search
      ? withMobileSearchClose(search, () => setMobileSearchOpen(false))
      : search;

  return (
    <div className={`page-header${mobileSearchOpen ? " page-header--search-open" : ""}`}>
      <div className="page-header-left">
        <PageHeaderMenuButton />
        {!mobileSearchOpen && (title ? <h2>{title}</h2> : null)}
        {!mobileSearchOpen && left}
      </div>
      <div className="page-header-center">
        {center && !isMobile ? center : null}
        {search && !isMobile ? (
          search
        ) : search && isMobile && mobileSearchOpen ? (
          <div className="page-header-search-expand" ref={mobileSearchWrapRef}>
            {mobileSearchContent}
          </div>
        ) : null}
      </div>
      <div className="page-header-right">
        {showMobileSearchToggle && !mobileSearchOpen ? (
          <button
            type="button"
            className="page-header-search-toggle"
            aria-label="Поиск"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen(true)}
          >
            <PageHeaderSearchMagnifier size={18} />
          </button>
        ) : null}
        {mobileSelect ? (
          <div className="page-header-toolbar-slot page-header-toolbar--mobile">{mobileSelect}</div>
        ) : null}
        <div className="page-header-actions--desktop">
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
        {overflowItems && overflowItems.length > 0 ? (
          <PageHeaderOverflow
            className="page-header-actions--mobile"
            items={overflowItems}
          />
        ) : null}
      </div>
    </div>
  );
}
