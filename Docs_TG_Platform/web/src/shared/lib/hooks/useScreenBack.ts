"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { getParentPath, routes } from "@/shared/config/routes";

export function useScreenBack() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const parent = getParentPath(pathname ?? "/");
    router.push(parent ?? routes.home());
  }, [router, pathname]);
}
