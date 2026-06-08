"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type ErrorFallbackProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function ErrorFallback({
  message,
  onRetry,
  retryLabel = "Повторить",
  className,
}: ErrorFallbackProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-8 text-center", className)}>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
