import type { ReactNode } from "react";

export type CtxMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
};

export type PortalLayout = {
  top: number;
  left: number;
  minWidth: number;
  width?: number;
  visible: boolean;
};

export type PortalLayoutOpts = {
  align: "left" | "right";
  matchTriggerWidth: boolean;
  panelMinWidth?: number;
};

export type ContextMenuProps = {
  items: CtxMenuItem[];
  trigger?: ReactNode;
  className?: string;
  /** Доп. классы панели (важно для portal — панель вне DOM-родителя). */
  dropdownClassName?: string;
  /** `custom` — свой класс кнопки (например `.page-header-select`). */
  triggerVariant?: "menu" | "custom";
  triggerClassName?: string;
  panelMinWidth?: number;
  /** Минимальная ширина панели = ширина триггера. */
  matchTriggerWidth?: boolean;
  /** Для `portal`: `left` — левый край меню с левого края кнопки; `right` — с правого. */
  align?: "left" | "right";
  /** Рендер выпадающего списка в `document.body` (чтобы не обрезался `overflow` родителя). */
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Подпись кнопки-триггера (экранные читалки). */
  triggerAriaLabel?: string;
};
