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

  /** Ширина по самой длинной подписи — панель и кнопка не меняют размер при открытии */
  const wrapWidth = useMemo(() => {
    const longest = options.reduce((max, o) => Math.max(max, o.label.length), 0);
    const ch = Math.max(longest, 3);
    return `calc(${ch}ch + 4rem)`;
  }, [options]);

  const selectClass = className
    ? `page-header-select ${className}`
    : "page-header-select";

  if (isMobile) {
    return (
      <div className="page-header-select-wrap" style={{ width: wrapWidth }}>
        <ContextMenu
          className="page-header-select-ctx"
          triggerVariant="custom"
          triggerClassName={selectClass}
          trigger={<span className="page-header-select-trigger-text">{currentLabel}</span>}
          triggerAriaLabel={ariaLabel}
          portal
          align="right"
          matchTriggerWidth
          panelMinWidth={120}
          dropdownClassName="ctx-dropdown--page-header-control ctx-dropdown--page-header-select"
          items={options.map((o) => ({
            label: o.label,
            active: o.value === value,
            onClick: () => onChange(o.value),
          }))}
        />
        <PageHeaderSelectChevron />
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
