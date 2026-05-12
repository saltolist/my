"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ModelOption = { id: string; label: string };

type Props = {
  icon: ReactNode;
  value: string;
  options: ModelOption[];
  onChange: (id: string) => void;
  emptyValue?: string;
  emptyLabel?: string;
  placeholderLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  placement?: "up" | "down";
};

type Pos =
  | { mode: "up"; bottom: number; left: number; width: number }
  | { mode: "down"; top: number; left: number; width: number };

export default function ModelPicker({
  icon,
  value,
  options,
  onChange,
  emptyValue,
  emptyLabel,
  placeholderLabel,
  disabled,
  ariaLabel,
  placement = "up",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    if (placement === "down") {
      setPos({ mode: "down", top: r.bottom + 6, left: r.left, width: r.width });
    } else {
      setPos({ mode: "up", bottom: window.innerHeight - r.top + 6, left: r.left, width: r.width });
    }
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      updatePos();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const isEmpty = emptyValue !== undefined && value === emptyValue;
  const selected = !isEmpty ? options.find((o) => o.id === value) : null;
  const label =
    selected?.label ??
    (isEmpty && emptyLabel ? emptyLabel : placeholderLabel ?? "Выбрать");
  const isDisabled = disabled || (options.length === 0 && emptyValue === undefined);

  return (
    <div className={`model-picker${open ? " is-open" : ""}${isDisabled ? " is-disabled" : ""}`}>
      <button
        ref={btnRef}
        type="button"
        className="model-picker-btn"
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDisabled) setOpen((v) => !v);
        }}
      >
        <span className="model-picker-icon">{icon}</span>
        <span className="model-picker-label">{label}</span>
        <svg
          className="model-picker-chevron"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && !isDisabled && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              className="model-picker-dropdown"
              role="listbox"
              style={
                pos.mode === "down"
                  ? { top: pos.top, left: pos.left, minWidth: pos.width }
                  : { bottom: pos.bottom, left: pos.left, minWidth: pos.width }
              }
            >
              {emptyValue !== undefined && emptyLabel ? (
                <div
                  role="option"
                  aria-selected={value === emptyValue}
                  className={`model-picker-item${value === emptyValue ? " active" : ""}`}
                  onClick={() => {
                    onChange(emptyValue);
                    setOpen(false);
                  }}
                >
                  <span className="model-picker-item-label">{emptyLabel}</span>
                </div>
              ) : null}
              {options.map((opt) => (
                <div
                  key={opt.id}
                  role="option"
                  aria-selected={value === opt.id}
                  className={`model-picker-item${value === opt.id ? " active" : ""}`}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <span className="model-picker-item-label">{opt.label}</span>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function BrainIcon() {
  return (
    <svg
      className="model-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      className="model-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}
