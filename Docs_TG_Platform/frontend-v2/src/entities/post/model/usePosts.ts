"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import type { Post } from "@/shared/types";

export function usePosts() {
  const { posts } = useRepositories();

  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => posts.list(),
  });
}

export function usePost(id: number) {
  const { posts } = useRepositories();

  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      const list = await posts.list();
      const post = list.find((p) => p.id === id);
      if (!post) throw new Error(`Post ${id} not found`);
      return post;
    },
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreatePost() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: Post) => posts.create(post),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePost() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Post> }) => posts.update(id, patch),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useReorderPosts() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nextPosts: Post[]) => posts.reorder(nextPosts),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePost() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => posts.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}
