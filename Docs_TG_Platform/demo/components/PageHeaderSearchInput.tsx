"use client";

import type { InputHTMLAttributes } from "react";

function PageHeaderSearchMagnifier() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" />
    </svg>
  );
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  className?: string;
};

/** Поле поиска в шапке: лупа слева, плейсхолдер начинается после неё */
export default function PageHeaderSearchInput({ className, ...props }: Props) {
  return (
    <div className="page-header-search-field">
      <span className="page-header-search-field-icon" aria-hidden>
        <PageHeaderSearchMagnifier />
      </span>
      <input type="text" className={className ?? "page-header-search"} {...props} />
    </div>
  );
}
