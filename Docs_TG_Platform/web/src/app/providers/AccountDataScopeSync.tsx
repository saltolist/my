"use client";

import { useEffect, useRef } from "react";

import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import { useQueryAccountScope } from "@/app/providers/useQueryAccountScope";
import { setChannelMetricsAccount } from "@/shared/lib/channelMetricsDb";

/** Keeps derived analytics DB and profile draft aligned with the active MSW account. */
export function AccountDataScopeSync() {
  const accountId = useQueryAccountScope();
  const prevAccountIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setChannelMetricsAccount(accountId);
    if (prevAccountIdRef.current !== undefined && prevAccountIdRef.current !== accountId) {
      useProfileDraftStore.getState().resetForLogout();
    }
    prevAccountIdRef.current = accountId;
  }, [accountId]);

  return null;
}
