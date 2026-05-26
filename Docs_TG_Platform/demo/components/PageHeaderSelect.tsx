"use client";

import { useMemo } from "react";
import { ContextMenu } from "@/components/ContextMenu";
import { useMobile760 } from "@/lib/hooks/useMobile760";

export type PageHeaderSelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: readonly PageHeaderSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

function PageHeaderSelectChevron() {
  return (
    <svg
      className="page-header-select-chevron"
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

export default function PageHeaderSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: Props) {
  const isMobile = useMobile760();

  const currentLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  /** Ширина под выбранный пункт — без лишней “пустоты” */
  const wrapWidth = useMemo(() => {
    const ch = Math.max(currentLabel.length, 3);
    return `calc(${ch}ch + 3.1rem)`;
  }, [currentLabel]);

  /** Меню — по самой широкой подписи, без переносов */
  const panelMinWidth = useMemo(() => {
    const longest = options.reduce((max, o) => Math.max(max, o.label.length), 0);
    // Оценка ширины: ~8px на символ + отступы/иконка/паддинги
    return Math.min(420, Math.max(160, longest * 8 + 64));
  }, [options]);

  const selectClass = className
    ? `page-header-select ${className}`
    : "page-header-select";

  if (isMobile) {
    return (
      <div className="page-header-select-wrap page-header-select-wrap--mobile" style={{ width: wrapWidth }}>
        <ContextMenu
          className="page-header-select-ctx"
          triggerVariant="custom"
          triggerClassName={selectClass}
          trigger={
            <span className="page-header-select-trigger">
              <span className="page-header-select-trigger-text">{currentLabel}</span>
              <svg
                className="page-header-select-chevron page-header-select-chevron--inline"
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
            </span>
          }
          triggerAriaLabel={ariaLabel}
          portal
          align="right"
          panelMinWidth={panelMinWidth}
          dropdownClassName="ctx-dropdown--page-header-control ctx-dropdown--page-header-select"
          items={options.map((o) => ({
            label: o.label,
            active: o.value === value,
            onClick: () => onChange(o.value),
          }))}
        />
      </div>
    );
  }

  return (
    <div className="page-header-select-wrap" style={{ width: wrapWidth }}>
      <select
        className={selectClass}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <PageHeaderSelectChevron />
    </div>
  );
}
