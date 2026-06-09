"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type { GlobalNote } from "@/shared/types";

export function useGlobalNotes() {
  const { notes } = useRepositories();

  return useQuery({
    queryKey: queryKeys.globalNotes.list(),
    queryFn: () => notes.listGlobal(),
  });
}

export function useUpsertGlobalNote() {
  const { notes } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: GlobalNote) => notes.upsert(note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalNotes.all });
    },
  });
}

export function useDeleteGlobalNote() {
  const { notes } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notes.remove(noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.globalNotes.all });
    },
  });
}
