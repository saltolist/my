"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { routes } from "@/shared/lib/routes";

/** Allows shell when logged in or in presentation mode (no session). */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, session, isPresentationMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session && !isPresentationMode) {
      router.replace(routes.login());
    }
  }, [isPresentationMode, ready, router, session]);

  if (!ready) return null;
  if (!session && !isPresentationMode) return null;

  return children;
}
