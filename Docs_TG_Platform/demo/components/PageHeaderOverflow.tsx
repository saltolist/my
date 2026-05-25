"use client";

import type { ReactNode } from "react";
import { ContextMenu, type CtxMenuItem } from "./ContextMenu";

export type PageHeaderOverflowItem = {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
};

type Props = {
  items: PageHeaderOverflowItem[];
  triggerAriaLabel?: string;
  className?: string;
};

export default function PageHeaderOverflow({
  items,
  triggerAriaLabel = "Действия в шапке",
  className,
}: Props) {
  const menuItems: CtxMenuItem[] = items
    .filter((item) => !item.hidden)
    .map((item) => ({
      label: item.label,
      icon: item.icon,
      danger: item.danger,
      disabled: item.disabled,
      onClick: item.onClick,
    }));

  if (menuItems.length === 0) return null;

  return (
    <div className={className ?? undefined}>
      <ContextMenu
        className="page-header-overflow"
        items={menuItems}
        triggerAriaLabel={triggerAriaLabel}
        portal
        align="right"
      />
    </div>
  );
}
