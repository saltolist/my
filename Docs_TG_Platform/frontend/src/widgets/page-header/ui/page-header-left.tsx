import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/shared/ui/breadcrumb";

export type PageHeaderLeftProps = {
  title?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
};

export function PageHeaderLeft({ title, breadcrumbs }: PageHeaderLeftProps) {
  const hasBreadcrumbs = breadcrumbs != null && breadcrumbs.length > 0;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {hasBreadcrumbs ? (
        <Breadcrumb items={breadcrumbs} />
      ) : title ? (
        <h1 className="truncate text-base font-semibold">{title}</h1>
      ) : null}
    </div>
  );
}
