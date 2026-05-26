"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  onOpenChange,
  triggerAriaLabel,
}: {
  items: CtxMenuItem[];
  trigger?: ReactNode;
  className?: string;
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

  useLayoutEffect(() => {
    if (!open || !portal || !btnRef.current) {
      setPortalPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const maxMenuW = 280;
    const pad = 8;
    const left =
      align === "right"
        ? Math.min(window.innerWidth - DROPDOWN_MIN_W - pad, Math.max(pad, r.right - DROPDOWN_MIN_W))
        : Math.max(pad, Math.min(r.left, window.innerWidth - maxMenuW - pad));
    setPortalPos({ top: r.bottom + DROPDOWN_OFFSET, left });
  }, [open, portal, align]);

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
              className="ctx-dropdown ctx-dropdown-portal open"
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                right: "auto",
                minWidth: DROPDOWN_MIN_W,
                width: "max-content",
                maxWidth: "min(280px, calc(100vw - 16px))",
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
          className={`ctx-dropdown${open ? " open" : ""}`}
          style={align === "left" ? { left: 0, right: "auto" } : undefined}
        >
          {dropdownBody}
        </div>
      ) : null}
    </div>
  );
}
