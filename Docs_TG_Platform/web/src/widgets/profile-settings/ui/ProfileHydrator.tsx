"use client";

import { useEffect } from "react";

import { useQueryAccountScope } from "@/app/providers/useQueryAccountScope";
import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import {
  useAiProfile,
  useChannelProfile,
  useTelegramProfile,
} from "@/entities/channel";

/** Loads React Query profile data into the local draft store after account switch. */
export function ProfileHydrator() {
  const accountId = useQueryAccountScope();
  const { data: channel } = useChannelProfile();
  const { data: ai } = useAiProfile();
  const { data: telegram } = useTelegramProfile();
  const hydrateFromServer = useProfileDraftStore((s) => s.hydrateFromServer);
  const hydrated = useProfileDraftStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated || !channel || !ai || !telegram) return;
    hydrateFromServer(channel, ai, telegram);
  }, [accountId, ai, channel, hydrated, hydrateFromServer, telegram]);

  return null;
}
