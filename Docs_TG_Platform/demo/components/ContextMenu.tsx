"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type CtxMenuItem = {
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
};

export function ContextMenu({
  items,
  trigger = "•••",
  className = "",
  align = "right",
}: {
  items: CtxMenuItem[];
  trigger?: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={ref} className={`ctx-wrap ${className}`}>
      <button
        className="ctx-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {trigger}
      </button>
      <div
        className={`ctx-dropdown${open ? " open" : ""}`}
        style={align === "left" ? { left: 0, right: "auto" } : undefined}
      >
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
      </div>
    </div>
  );
}
