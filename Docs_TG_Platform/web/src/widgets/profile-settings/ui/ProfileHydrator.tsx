"use client";

import { useEffect } from "react";

import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import {
  useAiProfile,
  useChannelProfile,
  useTelegramProfile,
} from "@/entities/channel";

/** Loads React Query profile data into the local draft store once per session. */
export function ProfileHydrator() {
  const { data: channel } = useChannelProfile();
  const { data: ai } = useAiProfile();
  const { data: telegram } = useTelegramProfile();
  const hydrateFromServer = useProfileDraftStore((s) => s.hydrateFromServer);
  const hydrated = useProfileDraftStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated || !channel || !ai || !telegram) return;
    hydrateFromServer(channel, ai, telegram);
  }, [ai, channel, hydrated, hydrateFromServer, telegram]);

  return null;
}
