"use client";

import { usePosts } from "@/entities/post";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function FeedScreen() {
  const { data, isLoading, error } = usePosts();

  return (
    <PlaceholderScreen title="Лента" subtitle="Секции опубликованных, отложенных и черновиков — M3+.">
      <DataStatus loading={isLoading} error={error} count={data?.length} label="постов" />
    </PlaceholderScreen>
  );
}
