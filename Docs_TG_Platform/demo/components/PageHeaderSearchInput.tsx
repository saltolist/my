"use client";

import type { InputHTMLAttributes, Ref } from "react";

export function PageHeaderSearchMagnifier({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
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
  inputRef?: Ref<HTMLInputElement>;
};

/** Поле поиска в шапке: лупа слева, плейсхолдер начинается после неё */
export default function PageHeaderSearchInput({ className, inputRef, ...props }: Props) {
  return (
    <div className="page-header-search-field">
      <span className="page-header-search-field-icon" aria-hidden>
        <PageHeaderSearchMagnifier />
      </span>
      <input ref={inputRef} type="text" className={className ?? "page-header-search"} {...props} />
    </div>
  );
}
