"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import { useRepositories } from "@/app/providers/RepositoryProvider";
import { useAuthenticatedQueryEnabled } from "@/app/providers/useAuthenticatedQueryEnabled";
import type { Post } from "@/shared/types";

export function usePosts() {
  const { posts } = useRepositories();
  const enabled = useAuthenticatedQueryEnabled();

  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => posts.list(),
    enabled,
  });
}

export function usePost(id: number) {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();
  const enabled = useAuthenticatedQueryEnabled();

  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      const cached = queryClient.getQueryData<Post>(queryKeys.posts.detail(id));
      if (cached) return cached;
      const list = await posts.list();
      const post = list.find((p) => p.id === id);
      if (!post) throw new Error(`Post ${id} not found`);
      return post;
    },
    placeholderData: () => {
      const list = queryClient.getQueryData<Post[]>(queryKeys.posts.list());
      return list?.find((p) => p.id === id);
    },
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

export function useCreatePost() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: Post) => posts.create(post),
    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      const previous = queryClient.getQueryData<Post[]>(queryKeys.posts.list());
      queryClient.setQueryData<Post[]>(queryKeys.posts.list(), (prev = []) => [
        post,
        ...prev.filter((p) => p.id !== post.id),
      ]);
      queryClient.setQueryData(queryKeys.posts.detail(post.id), post);
      return { previous };
    },
    onError: (_error, _post, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.posts.list(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePost() {
  const { posts } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Post> }) => posts.update(id, patch),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(queryKeys.posts.detail(updatedPost.id), updatedPost);
      queryClient.setQueryData<Post[]>(queryKeys.posts.list(), (prev) =>
        prev?.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
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
