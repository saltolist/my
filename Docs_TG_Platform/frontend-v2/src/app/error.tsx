"use client";

import { Button } from "@/shared/ui/button";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-medium">Что-то пошло не так</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Попробуйте обновить страницу. Если ошибка повторяется — сообщите в issue.
      </p>
      <Button type="button" onClick={reset}>
        Повторить
      </Button>
    </div>
  );
}
