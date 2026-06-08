"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useCreatePost } from "@/entities/post/model/usePosts";
import { routes } from "@/shared/config/routes";
import { canSubmitFeedDraft, createDraftPost } from "@/shared/lib/feed/filterPosts";
import { Composer } from "@/widgets/composer";
import { FeedSearchBar, FeedWidget } from "@/widgets/feed";
import { PageHeader } from "@/widgets/page-header";

export function FeedScreen() {
  const router = useRouter();
  const createPost = useCreatePost();
  const [searchQuery, setSearchQuery] = useState("");

  const openPost = useCallback(
    (postId: number) => {
      router.push(routes.post(postId));
    },
    [router],
  );

  const handleComposerSubmit = useCallback(
    async (text: string) => {
      if (!canSubmitFeedDraft(text)) return false;
      const draft = createDraftPost({ text });
      await createPost.mutateAsync(draft);
      router.push(routes.post(draft.id));
      return true;
    },
    [createPost, router],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Лента"
        center={<FeedSearchBar value={searchQuery} onChange={setSearchQuery} />}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <FeedWidget
          searchQuery={searchQuery}
          onPostClick={openPost}
          onCommentsClick={openPost}
          className="p-4"
        />
      </div>
      <div className="shrink-0 border-t bg-background p-3">
        <Composer
          scope="feed"
          placeholder="Новый черновик… введите @ чтобы прикрепить пост"
          onSubmit={handleComposerSubmit}
        />
      </div>
    </div>
  );
}
