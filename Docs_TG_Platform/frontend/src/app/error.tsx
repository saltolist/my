"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/shared/ui/error-fallback";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex min-h-screen items-center justify-center bg-background p-8">
        <ErrorFallback
          message={error.message || "Произошла ошибка приложения"}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
