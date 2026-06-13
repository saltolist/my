"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { canAppNavigateBack } from "@/shared/lib/appNavStack";
import { getParentPath, routes } from "@/shared/lib/routes";

export type ScreenBackAction =
  | { type: "back" }
  | { type: "push"; href: string };

/** Back via in-app visit stack when possible; otherwise logical parent path. */
export function resolveScreenBackAction(
  pathname: string,
  searchParams?: URLSearchParams | null,
): ScreenBackAction {
  const params = searchParams ?? new URLSearchParams();
  if (canAppNavigateBack(pathname, params)) {
    return { type: "back" };
  }
  const parent = getParentPath(pathname);
  return { type: "push", href: parent ?? routes.home() };
}

export function useScreenBack() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const action = resolveScreenBackAction(pathname ?? "/", params);
    if (action.type === "back") router.back();
    else router.push(action.href);
  }, [router, pathname]);
}
