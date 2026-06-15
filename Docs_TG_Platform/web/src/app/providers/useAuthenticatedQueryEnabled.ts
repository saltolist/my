"use client";

import { useAuth } from "./AuthProvider";

/** Gate React Query fetches until auth session is restored from localStorage. */
export function useAuthenticatedQueryEnabled(): boolean {
  const { session, ready } = useAuth();
  return ready && !!session;
}
