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
};

export default function ChartSeriesSelector({
  label,
  items,
  isVisible,
  onVisibleChange,
}: ChartSeriesSelectorProps) {
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

  return (
    <div className={`chart-series-selector${open ? " is-open" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className="chart-series-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerLabel}
        disabled={items.length === 0}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="chart-series-selector-trigger-text">{triggerLabel}</span>
      </button>
      {open && panelPos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="chart-series-selector-panel profile-checkbox-scope"
              role="listbox"
              aria-label={label}
              style={{
                top: panelPos.top,
                left: panelPos.left,
                minWidth: Math.max(panelPos.width, 220),
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
