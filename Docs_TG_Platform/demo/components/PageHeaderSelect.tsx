"use client";

import { useMemo } from "react";

export type PageHeaderSelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: readonly PageHeaderSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

export default function PageHeaderSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: Props) {
  /** Текущая подпись (ch) + отступы и chevron */
  const wrapWidth = useMemo(() => {
    const label = options.find((o) => o.value === value)?.label ?? "";
    const ch = Math.max(label.length, 3);
    return `calc(${ch}ch + 4rem)`;
  }, [options, value]);

  return (
    <div className="page-header-select-wrap" style={{ width: wrapWidth }}>
      <select
        className={className ? `page-header-select ${className}` : "page-header-select"}
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
    </div>
  );
}
