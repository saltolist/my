"use client";

import { isTelegramChannelConnected } from "@/shared/lib/channel/isTelegramChannelConnected";
import { useTelegramProfile } from "./useProfile";

export function useChannelConnected() {
  const { data: telegram, isLoading, isFetching } = useTelegramProfile();

  return {
    telegram,
    isLoading: isLoading || isFetching,
    isConnected: isTelegramChannelConnected(telegram),
  };
}
