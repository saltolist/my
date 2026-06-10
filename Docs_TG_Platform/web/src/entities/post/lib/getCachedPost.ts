import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";
import type { Post } from "@/shared/types";

/** Post screen uses `posts.detail`; other screens may only have `posts.list`. */
export function getCachedPost(queryClient: QueryClient, postId: number): Post | undefined {
  const fromList = queryClient
    .getQueryData<Post[]>(queryKeys.posts.list())
    ?.find((p) => p.id === postId);
  if (fromList) return fromList;
  return queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));
}

export function setCachedPost(queryClient: QueryClient, post: Post): void {
  queryClient.setQueryData(queryKeys.posts.detail(post.id), post);
  const list = queryClient.getQueryData<Post[]>(queryKeys.posts.list());
  if (!list) return;
  queryClient.setQueryData(
    queryKeys.posts.list(),
    list.map((p) => (p.id === post.id ? post : p)),
  );
}
