"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type CtxMenuItem = {
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
};

const DROPDOWN_MIN_W = 200;

export function ContextMenu({
  items,
  trigger = "•••",
  className = "",
  align = "right",
  portal = false,
  onOpenChange,
}: {
  items: CtxMenuItem[];
  trigger?: ReactNode;
  className?: string;
  /** Для `portal`: `left` — левый край меню с левого края кнопки; `right` — с правого. */
  align?: "left" | "right";
  /** Рендер выпадающего списка в `document.body` (чтобы не обрезался `overflow` родителя). */
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
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
    setPortalPos({ top: r.bottom + 4, left });
  }, [open, portal, align]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (dropdownRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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
          {it.icon ? `${it.icon} ` : ""}
          {it.label}
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
        onClick={(e) => {
          e.stopPropagation();
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
