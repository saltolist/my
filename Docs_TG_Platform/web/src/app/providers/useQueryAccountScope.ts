"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { getQueryAccountIdFromAuth } from "@/shared/lib/auth/queryAccountScope";
import { PRESENTATION_ACCOUNT_ID } from "@/shared/lib/auth/constants";

/** MSW tenant id for React Query cache partitioning. */
export function useQueryAccountScope(): string {
  const { session, isPresentationMode, ready } = useAuth();
  if (!ready) return PRESENTATION_ACCOUNT_ID;
  if (session?.accountId) return session.accountId;
  if (isPresentationMode) return PRESENTATION_ACCOUNT_ID;
  return getQueryAccountIdFromAuth();
}
