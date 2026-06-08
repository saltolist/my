"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import type { BreadcrumbItem } from "@/shared/ui/breadcrumb";

import { PageHeaderCenter } from "./page-header-center";
import { PageHeaderLeft } from "./page-header-left";
import { PageHeaderRight } from "./page-header-right";

export type PageHeaderBreadcrumb = BreadcrumbItem;

export type PageHeaderProps = {
  title?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  center?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  breadcrumbs,
  center,
  onBack,
  backLabel,
  showBack,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "glass-header sticky top-0 z-10 grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4",
        className,
      )}
    >
      <PageHeaderLeft title={title} breadcrumbs={breadcrumbs} />
      <PageHeaderCenter>{center}</PageHeaderCenter>
      <PageHeaderRight
        actions={actions}
        onBack={onBack}
        backLabel={backLabel}
        showBack={showBack}
      />
    </header>
  );
}
