"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { registerToastBridge, type ToastOptions } from "./toastBridge";

const TOAST_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = useCallback((options: ToastOptions) => {
    clearTimer();
    setToast(options);
    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, TOAST_MS);
  }, []);

  useEffect(() => {
    registerToastBridge({ show });
    return () => {
      clearTimer();
      registerToastBridge(null);
    };
  }, [show]);

  return (
    <>
      {children}
      {toast ? (
        <div className="app-toast-host" role="status" aria-live="polite">
          <div className={`app-toast app-toast--${toast.variant ?? "info"}`}>{toast.message}</div>
        </div>
      ) : null}
    </>
  );
}
