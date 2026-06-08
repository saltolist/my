"use client";

import { useCallback } from "react";

/** Validates and submits composer text; returns whether editor should clear. */
export function useSendMessage(onSubmit: (text: string) => boolean) {
  return useCallback(
    (text: string, clearEditor: () => void) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const ok = onSubmit(trimmed);
      if (ok) clearEditor();
    },
    [onSubmit],
  );
}
