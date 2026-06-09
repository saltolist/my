"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/shared/ui/error-fallback";

type ShellErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ShellError({ error, reset }: ShellErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <ErrorFallback
        message={error.message || "Не удалось загрузить страницу"}
        onRetry={reset}
      />
    </div>
  );
}
