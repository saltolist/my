"use client";

import { useEffect, useState, type ReactNode } from "react";
import { USE_MSW } from "@/shared/config/dataSource";

type MswProviderProps = {
  children: ReactNode;
};

export function MswProvider({ children }: MswProviderProps) {
  const [ready, setReady] = useState(!USE_MSW);

  useEffect(() => {
    if (!USE_MSW) return;

    let cancelled = false;

    async function startMsw() {
      const { startMsw } = await import("@/shared/api/msw/browser");
      await startMsw();
      if (!cancelled) setReady(true);
    }

    void startMsw().catch((error: unknown) => {
      console.error("[MSW] Failed to start mock worker", error);
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return children;
}
