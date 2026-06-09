"use client";

import { useParams } from "next/navigation";
import { usePost } from "@/entities/post";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { POST_NEW_SLUG } from "@/shared/lib/staticParams";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";
import { FileText } from "lucide-react";

export function PostScreen() {
  const params = useParams<{ id: string }>();
  const onBack = useScreenBack();
  const isNew = params.id === POST_NEW_SLUG;
  const postId = isNew ? 0 : Number(params.id);
  const { data, isLoading, error } = usePost(postId);

  const title = isNew ? "Новый пост" : data?.text.slice(0, 48) || `Пост #${params.id}`;

  return (
    <ScreenShell header={<PageHeader title={title} onBack={onBack} />}>
      <EmptyState
        icon={<FileText className="size-5" />}
        message={
          isLoading
            ? "Загрузка поста…"
            : error
              ? error.message
              : "Post workspace — M3+ (post-workspace widget)."
        }
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
