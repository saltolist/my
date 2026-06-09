"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {icon != null ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
