"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { routes } from "@/shared/lib/routes";

export function useTopLevelBack() {
  const router = useRouter();
  return useCallback(() => router.push(routes.home()), [router]);
}
