"use client";

import { useEffect, useState, type ReactNode } from "react";
import { USE_MSW } from "@/shared/config/dataSource";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

type MswProviderProps = {
  children: ReactNode;
};

type BootState = "ready" | "loading" | "error";

export function MswProvider({ children }: MswProviderProps) {
  const [bootState, setBootState] = useState<BootState>(USE_MSW ? "loading" : "ready");

  useEffect(() => {
    if (!USE_MSW) return;

    let cancelled = false;

    async function startMsw() {
      try {
        const { startMsw } = await import("@/shared/api/msw/browser");
        await startMsw();
        if (!cancelled) setBootState("ready");
      } catch (error: unknown) {
        console.error("[MSW] Failed to start mock worker", error);
        if (!cancelled) setBootState("error");
      }
    }

    void startMsw();

    return () => {
      cancelled = true;
    };
  }, []);

  if (bootState === "loading") {
    return <div className="msw-boot-screen">Загрузка демо-данных…</div>;
  }

  if (bootState === "error") {
    return (
      <div className="msw-error-screen">
        <EmptyState
          message="Не удалось запустить демо-данные (MSW). Проверьте mockServiceWorker.js и перезагрузите страницу."
          action={
            <Button type="button" onClick={() => window.location.reload()}>
              Перезагрузить
            </Button>
          }
        />
      </div>
    );
  }

  return children;
}
