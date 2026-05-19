"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import ProfileCheckbox from "@/components/profile/ProfileCheckbox";

export type ChartSeriesSelectorItem = {
  id: string;
  label: string;
  color: string;
};

type ChartSeriesSelectorProps = {
  label: string;
  items: ChartSeriesSelectorItem[];
  isVisible: (id: string) => boolean;
  onVisibleChange: (id: string, visible: boolean) => void;
  /** В профиле — те же pill-селекторы, что у выбора модели в настройках. */
  variant?: "default" | "profile";
};

function PickerChevron() {
  return (
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
  );
}

export default function ChartSeriesSelector({
  label,
  items,
  isVisible,
  onVisibleChange,
  variant = "default",
}: ChartSeriesSelectorProps) {
  const isProfile = variant === "profile";
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const visibleCount = useMemo(
    () => items.filter((item) => isVisible(item.id)).length,
    [items, isVisible],
  );

  const triggerLabel = useMemo(() => {
    if (items.length === 0) return label;
    return `${label} ${visibleCount}/${items.length}`;
  }, [items.length, label, visibleCount]);

  const updatePanelPos = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (open) updatePanelPos();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onReflow = () => updatePanelPos();

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open]);

  const rootClassName = isProfile
    ? `model-picker profile-model-picker chart-series-selector chart-series-selector--profile${open ? " is-open" : ""}`
    : `chart-series-selector${open ? " is-open" : ""}`;

  const triggerClassName = isProfile ? "model-picker-btn" : "chart-series-selector-trigger";
  const labelClassName = isProfile ? "model-picker-label" : "chart-series-selector-trigger-text";
  const panelClassName = isProfile
    ? "model-picker-dropdown chart-series-selector-panel chart-series-selector-panel--profile profile-checkbox-scope"
    : "chart-series-selector-panel profile-checkbox-scope";

  return (
    <div className={rootClassName}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerLabel}
        disabled={items.length === 0}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={labelClassName}>{triggerLabel}</span>
        {isProfile ? <PickerChevron /> : null}
      </button>
      {open && panelPos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className={panelClassName}
              role="listbox"
              aria-label={label}
              style={{
                top: panelPos.top,
                left: panelPos.left,
                minWidth: Math.max(panelPos.width, isProfile ? panelPos.width : 220),
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {items.map((item) => (
                <label key={item.id} className="profile-checkbox-label chart-series-selector-item">
                  <ProfileCheckbox
                    className="chart-series-selector-checkbox"
                    checked={isVisible(item.id)}
                    onChange={(event) => onVisibleChange(item.id, event.target.checked)}
                    aria-label={`${item.label}: показывать на графике`}
                    style={{ "--series-color": item.color } as CSSProperties}
                  />
                  <span className="chart-series-selector-item-label">{item.label}</span>
                </label>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
