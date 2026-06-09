"use client";

import { useParams } from "next/navigation";
import { usePost } from "@/entities/post";
import { POST_NEW_SLUG } from "@/shared/lib/staticParams";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function PostScreen() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === POST_NEW_SLUG;
  const postId = isNew ? 0 : Number(params.id);
  const { data, isLoading, error } = usePost(postId);

  return (
    <PlaceholderScreen
      title={isNew ? "Новый пост" : `Пост #${params.id}`}
      subtitle="Post workspace — M3+ (post-workspace widget)."
    >
      {isNew ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Черновик создаётся при открытии — логика RouteSync в M2.
        </p>
      ) : (
        <DataStatus
          loading={isLoading}
          error={error}
          count={data ? 1 : 0}
          label={`поста #${params.id}`}
        />
      )}
      {data ? (
        <p className="text-sm text-muted-foreground line-clamp-3">{data.text.slice(0, 120)}…</p>
      ) : null}
    </PlaceholderScreen>
  );
}
