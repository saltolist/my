"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Хлебные крошки" className={cn("flex min-w-0 items-center gap-1 text-sm", className)}>
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
