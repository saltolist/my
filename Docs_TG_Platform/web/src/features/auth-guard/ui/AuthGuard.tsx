"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { routes } from "@/shared/lib/routes";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(routes.login());
    }
  }, [ready, router, session]);

  if (!ready || !session) return null;

  return children;
}
