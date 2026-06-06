"use client";

import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  onClick?: () => void;
  /** Truncate long titles (post names) */
  variant?: "default" | "title";
  /** Marks the current page segment */
  current?: boolean;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

function itemClassName(item: BreadcrumbItem): string {
  if (item.current) {
    return item.variant === "title" ? "crumb-current bc-post-title" : "crumb-current";
  }
  return item.variant === "title" ? "bc-link bc-post-title" : "bc-link";
}

export default function Breadcrumb({ items, className }: Props) {
  return (
    <nav className={className ? `breadcrumb ${className}` : "breadcrumb"} aria-label="Хлебные крошки">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const cls = itemClassName({ ...item, current: item.current ?? isLast });
        const key = `${index}-${typeof item.label === "string" ? item.label : "node"}`;

        return (
          <span key={key} style={{ display: "contents" }}>
            {index > 0 ? <span className="bc-sep" aria-hidden="true">/</span> : null}
            {item.onClick && !isLast && !item.current ? (
              <button
                type="button"
                className={cls}
                onClick={item.onClick}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </button>
            ) : (
              <span className={cls} aria-current={isLast || item.current ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
