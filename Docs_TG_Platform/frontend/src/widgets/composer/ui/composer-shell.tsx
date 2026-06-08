import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type ComposerShellProps = {
  className?: string;
  children: ReactNode;
};

export function ComposerShell({ className, children }: ComposerShellProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 shadow-sm", className)}>{children}</div>
  );
}
