"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  clampFloatingPanelLeft,
  FLOATING_PANEL_EDGE_MARGIN_PX,
} from "@/lib/floatingPanel";
import { useOverlayDismissOnPointer } from "@/lib/hooks/useOverlayDismissOnPointer";

export type CtxMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
};

const DROPDOWN_MIN_W = 200;
const DROPDOWN_OFFSET = 12;

type PortalLayout = {
  top: number;
  left: number;
  minWidth: number;
  width?: number;
  visible: boolean;
};

type PortalLayoutOpts = {
  align: "left" | "right";
  matchTriggerWidth: boolean;
  panelMinWidth?: number;
};

function computePortalLayout(
  btn: HTMLButtonElement,
  dropdown: HTMLDivElement | null,
  { align, matchTriggerWidth, panelMinWidth }: PortalLayoutOpts,
): PortalLayout {
  const r = btn.getBoundingClientRect();
  const baseMin = panelMinWidth ?? DROPDOWN_MIN_W;

  if (matchTriggerWidth) {
    const panelWidth = Math.max(baseMin, Math.round(r.width));
    const preferredLeft = align === "right" ? r.right - panelWidth : r.left;
    return {
      top: r.bottom + DROPDOWN_OFFSET,
      left: clampFloatingPanelLeft(preferredLeft, panelWidth),
      minWidth: panelWidth,
      width: panelWidth,
      visible: true,
    };
  }

  const measured = dropdown?.offsetWidth ?? 0;
  const panelWidth = measured > 0 ? Math.max(baseMin, measured) : baseMin;
  const preferredLeft = align === "right" ? r.right - panelWidth : r.left;
  return {
    top: r.bottom + DROPDOWN_OFFSET,
    left: clampFloatingPanelLeft(preferredLeft, panelWidth),
    minWidth: panelWidth,
    visible: measured > 0,
  };
}

export function ContextMenu({
  items,
  trigger = "•••",
  className = "",
  align = "right",
  portal = false,
  dropdownClassName = "",
  triggerVariant = "menu",
  triggerClassName = "",
  panelMinWidth,
  matchTriggerWidth = false,
  onOpenChange,
  triggerAriaLabel,
}: {
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
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portalLayout, setPortalLayout] = useState<PortalLayout | null>(null);
  const layoutOptsRef = useRef<PortalLayoutOpts>({
    align,
    matchTriggerWidth,
    panelMinWidth,
  });
  layoutOptsRef.current = { align, matchTriggerWidth, panelMinWidth };

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (prevOpenRef.current === open) return;
    prevOpenRef.current = open;
    onOpenChangeRef.current?.(open);
  }, [open]);

  const syncPortalLayout = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    setPortalLayout(
      computePortalLayout(btn, dropdownRef.current, layoutOptsRef.current),
    );
  }, []);

  useLayoutEffect(() => {
    if (!open || !portal) {
      setPortalLayout(null);
      return;
    }
    syncPortalLayout();
    if (matchTriggerWidth) return;
    // Панель уже в DOM: один повторный замер в том же кадре, без rAF-скачка
    syncPortalLayout();
  }, [open, portal, matchTriggerWidth, syncPortalLayout, items]);

  useLayoutEffect(() => {
    if (!open || !portal) return;
    const onReflow = () => syncPortalLayout();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, portal, syncPortalLayout]);

  const { consumeSuppressTriggerClick } = useOverlayDismissOnPointer({
    open,
    onClose: () => setOpen(false),
    contentRef: dropdownRef,
    triggerRef: btnRef,
  });

  const openPortal = () => {
    const btn = btnRef.current;
    if (portal && btn) {
      setPortalLayout(computePortalLayout(btn, null, layoutOptsRef.current));
    }
    setOpen(true);
  };

  const closePortal = () => {
    setOpen(false);
    setPortalLayout(null);
  };

  const togglePortal = () => {
    if (open) closePortal();
    else openPortal();
  };

  const dropdownBody = (
    <>
      {items.map((it, i) => (
        <div
          key={i}
          className={`ctx-item${it.active ? " active" : ""}${it.danger ? " danger" : ""}${
            it.disabled ? " disabled" : ""
          }`}
          onClick={() => {
            if (it.disabled) return;
            closePortal();
            it.onClick?.();
          }}
        >
          {it.icon != null ? <span className="ctx-item-icon">{it.icon}</span> : null}
          <span className="ctx-item-label">{it.label}</span>
        </div>
      ))}
    </>
  );

  const triggerBtnClass =
    triggerVariant === "custom" ? triggerClassName || "ctx-btn" : "ctx-btn";
  const wrapClass =
    triggerVariant === "custom"
      ? className
      : `ctx-wrap${className ? ` ${className}` : ""}`;

  const basePanelMinWidth = panelMinWidth ?? DROPDOWN_MIN_W;
  const panelStyle = portalLayout ?? {
    top: 0,
    left: 0,
    minWidth: basePanelMinWidth,
    visible: false,
  };

  return (
    <div ref={wrapRef} className={wrapClass || undefined}>
      <button
        ref={btnRef}
        className={triggerBtnClass}
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (consumeSuppressTriggerClick()) return;
          if (portal) togglePortal();
          else setOpen((v) => !v);
        }}
      >
        {trigger}
      </button>
      {portal && open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              className={`ctx-dropdown ctx-dropdown-portal open${dropdownClassName ? ` ${dropdownClassName}` : ""}`}
              style={{
                position: "fixed",
                top: panelStyle.top,
                left: panelStyle.left,
                right: "auto",
                minWidth: panelStyle.minWidth,
                width: panelStyle.width,
                maxWidth: matchTriggerWidth
                  ? panelStyle.width
                  : `min(280px, calc(100vw - ${FLOATING_PANEL_EDGE_MARGIN_PX * 2}px))`,
                zIndex: 2000,
                visibility: panelStyle.visible ? "visible" : "hidden",
                pointerEvents: panelStyle.visible ? "auto" : "none",
              }}
            >
              {dropdownBody}
            </div>,
            document.body,
          )
        : null}
      {!portal ? (
        <div
          ref={dropdownRef}
          className={`ctx-dropdown${dropdownClassName ? ` ${dropdownClassName}` : ""}${open ? " open" : ""}`}
          style={align === "left" ? { left: 0, right: "auto" } : undefined}
        >
          {dropdownBody}
        </div>
      ) : null}
    </div>
  );
}
