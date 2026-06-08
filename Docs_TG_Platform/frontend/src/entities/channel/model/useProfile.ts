"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type {
  AiProfileConfig,
  ChannelProfileConfig,
  TelegramProfileConfig,
} from "@/shared/types";

export function useChannelProfile() {
  const { profile } = useRepositories();

  return useQuery({
    queryKey: queryKeys.profile.channel(),
    queryFn: () => profile.getChannel(),
  });
}

export function useUpdateChannelProfile() {
  const { profile } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: ChannelProfileConfig) => profile.updateChannel(config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.channel(), data);
    },
  });
}

export function useAiProfile() {
  const { profile } = useRepositories();

  return useQuery({
    queryKey: queryKeys.profile.ai(),
    queryFn: () => profile.getAi(),
  });
}

export function useUpdateAiProfile() {
  const { profile } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: AiProfileConfig) => profile.updateAi(config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.ai(), data);
    },
  });
}

export function useTelegramProfile() {
  const { profile } = useRepositories();

  return useQuery({
    queryKey: queryKeys.profile.telegram(),
    queryFn: () => profile.getTelegram(),
  });
}

export function useUpdateTelegramProfile() {
  const { profile } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: TelegramProfileConfig) => profile.updateTelegram(config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.telegram(), data);
    },
  });
}
