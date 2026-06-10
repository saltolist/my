"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { getParentPath, routes } from "@/shared/lib/routes";

export type ScreenBackAction =
  | { type: "back" }
  | { type: "push"; href: string };

/** Back via browser history when possible; otherwise logical parent path. */
export function resolveScreenBackAction(
  pathname: string,
  historyLength: number,
): ScreenBackAction {
  if (historyLength > 1) return { type: "back" };
  const parent = getParentPath(pathname);
  return { type: "push", href: parent ?? routes.home() };
}

export function useScreenBack() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const action = resolveScreenBackAction(
      pathname ?? "/",
      typeof window !== "undefined" ? window.history.length : 1,
    );
    if (action.type === "back") router.back();
    else router.push(action.href);
  }, [router, pathname]);
}
