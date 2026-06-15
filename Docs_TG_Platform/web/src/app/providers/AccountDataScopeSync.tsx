"use client";

import { useEffect } from "react";

import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import { useQueryAccountScope } from "@/app/providers/useQueryAccountScope";
import { setChannelMetricsAccount } from "@/shared/lib/channelMetricsDb";

/** Keeps derived analytics DB and profile draft aligned with the active MSW account. */
export function AccountDataScopeSync() {
  const accountId = useQueryAccountScope();

  useEffect(() => {
    setChannelMetricsAccount(accountId);
    useProfileDraftStore.getState().resetForLogout();
  }, [accountId]);

  return null;
}
