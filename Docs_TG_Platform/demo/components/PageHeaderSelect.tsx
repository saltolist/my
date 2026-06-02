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
  /** `both` — как селектор вкладок; `down` — одна стрелка вниз */
  chevron?: "both" | "down";
};

function PageHeaderSelectChevron({
  inline,
  variant = "both",
}: {
  inline?: boolean;
  variant?: "both" | "down";
}) {
  return (
    <svg
      className={`page-header-select-chevron${inline ? " page-header-select-chevron--inline" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === "down" ? (
        <polyline points="8 10 12 14 16 10" />
      ) : (
        <>
          <polyline points="8 9 12 5 16 9" />
          <polyline points="8 15 12 19 16 15" />
        </>
      )}
    </svg>
  );
}

export default function PageHeaderSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  chevron = "both",
}: Props) {
  const isMobile = useMobile760();

  const currentLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  /** Ширина под выбранный пункт — без лишней «пустоты» */
  const wrapWidth = useMemo(() => {
    const ch = Math.max(currentLabel.length, 3);
    return `calc(${ch}ch + 3.1rem)`;
  }, [currentLabel]);

  /** Меню — по самой широкой подписи, без переносов */
  const panelMinWidth = useMemo(() => {
    const longest = options.reduce((max, o) => Math.max(max, o.label.length), 0);
    return Math.min(420, Math.max(160, longest * 8 + 64));
  }, [options]);

  const selectClass = className
    ? `page-header-select ${className}`
    : "page-header-select";

  return (
    <div
      className={`page-header-select-wrap${isMobile ? " page-header-select-wrap--mobile" : ""}`}
      style={{ width: wrapWidth }}
    >
      <ContextMenu
        className="page-header-select-ctx"
        triggerVariant="custom"
        triggerClassName={selectClass}
        trigger={
          <span className="page-header-select-trigger">
            <span className="page-header-select-trigger-text">{currentLabel}</span>
            <PageHeaderSelectChevron inline variant={chevron} />
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
