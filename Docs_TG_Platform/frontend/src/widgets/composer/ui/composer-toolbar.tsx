import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type ComposerToolbarProps = {
  children: ReactNode;
  sendButton: ReactNode;
  className?: string;
};

export function ComposerToolbar({ children, sendButton, className }: ComposerToolbarProps) {
  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-2", className)}>
      {children}
      <div className="flex-1" />
      {sendButton}
    </div>
  );
}
