import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";

export async function refreshPostsAfterChannelImport(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
}
