"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { clampFloatingPanelLeft } from "@/lib/floatingPanel";
import { useFloatingPanelScrollListeners } from "@/lib/hooks/useFloatingPanelScrollListeners";
import { useOverlayDismissOnPointer } from "@/lib/hooks/useOverlayDismissOnPointer";

export type ModelOption = { id: string; label: string };
export type ModelPickerSection = { title: string; options: ModelOption[] };

type Props = {
  icon?: ReactNode;
  value: string;
  options?: ModelOption[];
  sections?: ModelPickerSection[];
  onChange: (id: string) => void;
  emptyValue?: string;
  emptyLabel?: string;
  placeholderLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  placement?: "up" | "down";
  className?: string;
  dropdownClassName?: string;
  /** Подпись на кнопке; пункты меню — из options/sections.label */
  buttonLabelFormatter?: (opt: ModelOption) => string;
};

type Pos =
  | { mode: "up"; bottom: number; left: number; width: number }
  | { mode: "down"; top: number; left: number; width: number };

export default function ModelPicker({
  icon,
  value,
  options = [],
  sections,
  onChange,
  emptyValue,
  emptyLabel,
  placeholderLabel,
  disabled,
  ariaLabel,
  placement = "up",
  className,
  dropdownClassName,
  buttonLabelFormatter,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isComposerPicker = className?.includes("composer-model-picker");

  const updatePos = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const minWidth = Math.max(r.width, isComposerPicker ? r.width : 140);
    const panelWidth = dropdownRef.current?.offsetWidth ?? minWidth;
    const left = clampFloatingPanelLeft(r.left, panelWidth);
    if (placement === "down") {
      setPos({ mode: "down", top: r.bottom + 6, left, width: r.width });
    } else {
      setPos({ mode: "up", bottom: window.innerHeight - r.top + 6, left, width: r.width });
    }
  }, [placement, isComposerPicker]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const raf = requestAnimationFrame(updatePos);
    return () => cancelAnimationFrame(raf);
  }, [open, updatePos]);

  const { consumeSuppressTriggerClick } = useOverlayDismissOnPointer({
    open,
    onClose: () => setOpen(false),
    contentRef: dropdownRef,
    triggerRef: btnRef,
  });

  useFloatingPanelScrollListeners({
    open,
    onReflow: updatePos,
    onClose: () => setOpen(false),
  });

  const flatOptions = sections ? sections.flatMap((s) => s.options) : options;
  const isEmpty = emptyValue !== undefined && value === emptyValue;
  const selected = !isEmpty ? flatOptions.find((o) => o.id === value) : null;
  const label = selected
    ? buttonLabelFormatter
      ? buttonLabelFormatter(selected)
      : selected.label
    : isEmpty && emptyLabel
      ? emptyLabel
      : placeholderLabel ?? "Выбрать";
  const isDisabled = disabled || (flatOptions.length === 0 && emptyValue === undefined);

  return (
    <div className={`model-picker${open ? " is-open" : ""}${isDisabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}>
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
          if (consumeSuppressTriggerClick()) return;
          if (!isDisabled) setOpen((v) => !v);
        }}
      >
        {icon ? <span className="model-picker-icon">{icon}</span> : null}
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
              className={`model-picker-dropdown${isComposerPicker ? " model-picker-dropdown--composer" : ""}${dropdownClassName ? ` ${dropdownClassName}` : ""}`}
              role="listbox"
              style={
                pos.mode === "down"
                  ? {
                      top: pos.top,
                      left: pos.left,
                      ...(isComposerPicker
                        ? { width: "max-content", minWidth: pos.width, maxWidth: "none" }
                        : { minWidth: pos.width }),
                    }
                  : {
                      bottom: pos.bottom,
                      left: pos.left,
                      ...(isComposerPicker
                        ? { width: "max-content", minWidth: pos.width, maxWidth: "none" }
                        : { minWidth: pos.width }),
                    }
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
              {sections
                ? sections.map((section) => (
                    <div key={section.title}>
                      <div className="model-picker-section-title">{section.title}</div>
                      {section.options.map((opt) => (
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
                    </div>
                  ))
                : options.map((opt) => (
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
