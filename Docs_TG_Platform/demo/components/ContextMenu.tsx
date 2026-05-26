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

export function ContextMenu({
  items,
  trigger = "•••",
  className = "",
  align = "right",
  portal = false,
  dropdownClassName = "",
  onOpenChange,
  triggerAriaLabel,
}: {
  items: CtxMenuItem[];
  trigger?: ReactNode;
  className?: string;
  /** Доп. классы панели (важно для portal — панель вне DOM-родителя). */
  dropdownClassName?: string;
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
  const [portalPos, setPortalPos] = useState<{ top: number; left: number } | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (prevOpenRef.current === open) return;
    prevOpenRef.current = open;
    onOpenChangeRef.current?.(open);
  }, [open]);

  const updatePortalPos = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const panelWidth = dropdownRef.current?.offsetWidth ?? DROPDOWN_MIN_W;
    const preferredLeft =
      align === "right" ? r.right - panelWidth : r.left;
    setPortalPos({
      top: r.bottom + DROPDOWN_OFFSET,
      left: clampFloatingPanelLeft(preferredLeft, panelWidth),
    });
  }, [align]);

  useLayoutEffect(() => {
    if (!open || !portal) {
      setPortalPos(null);
      return;
    }
    updatePortalPos();
    const raf = requestAnimationFrame(updatePortalPos);
    return () => cancelAnimationFrame(raf);
  }, [open, portal, updatePortalPos]);

  useLayoutEffect(() => {
    if (!open || !portal) return;
    const onReflow = () => updatePortalPos();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, portal, updatePortalPos]);

  const { consumeSuppressTriggerClick } = useOverlayDismissOnPointer({
    open,
    onClose: () => setOpen(false),
    contentRef: dropdownRef,
    triggerRef: btnRef,
  });

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
            setOpen(false);
            it.onClick?.();
          }}
        >
          {it.icon != null ? <span className="ctx-item-icon">{it.icon}</span> : null}
          <span className="ctx-item-label">{it.label}</span>
        </div>
      ))}
    </>
  );

  return (
    <div ref={wrapRef} className={`ctx-wrap ${className}`}>
      <button
        ref={btnRef}
        className="ctx-btn"
        type="button"
        aria-label={triggerAriaLabel}
        onClick={(e) => {
          e.stopPropagation();
          if (consumeSuppressTriggerClick()) return;
          setOpen((v) => !v);
        }}
      >
        {trigger}
      </button>
      {portal
        ? open &&
          portalPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              className={`ctx-dropdown ctx-dropdown-portal open${dropdownClassName ? ` ${dropdownClassName}` : ""}`}
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                right: "auto",
                minWidth: DROPDOWN_MIN_W,
                width: "max-content",
                maxWidth: `min(280px, calc(100vw - ${FLOATING_PANEL_EDGE_MARGIN_PX * 2}px))`,
                zIndex: 2000,
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
