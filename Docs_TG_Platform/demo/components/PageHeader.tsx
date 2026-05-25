"use client";

import type { ReactNode } from "react";
import { useApp } from "@/state/AppContext";
import type { ScreenId } from "@/lib/types";
import PageHeaderMenuButton from "./PageHeaderMenuButton";
import PageHeaderOverflow, { type PageHeaderOverflowItem } from "./PageHeaderOverflow";

type Props = {
  title?: ReactNode;
  left?: ReactNode;
  backTo?: ScreenId;
  onBack?: () => void;
  backLabel?: string;
  search?: ReactNode;
  /** На мобильной — селектор вкладок у правого края шапки */
  mobileSelect?: ReactNode;
  actions?: ReactNode;
  /** На мобильной — одно меню вместо ряда кнопок в `actions` */
  overflowItems?: PageHeaderOverflowItem[];
};

export default function PageHeader({
  title,
  left,
  backTo,
  onBack,
  backLabel = "← Назад",
  search,
  mobileSelect,
  actions,
  overflowItems,
}: Props) {
  const { navigateBack } = useApp();
  const handleBack = onBack ?? (backTo ? () => navigateBack(backTo) : undefined);
  return (
    <div className="page-header">
      <div className="page-header-left">
        <PageHeaderMenuButton />
        {title ? <h2>{title}</h2> : null}
        {left}
      </div>
      <div className="page-header-center">{search}</div>
      <div className="page-header-right">
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
