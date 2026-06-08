"use client";

import { useCallback, useMemo } from "react";

import { usePosts } from "@/entities/post/model/usePosts";
import { useUiStore } from "@/app/model/store/ui-store";
import { postTitle } from "@/shared/lib/postTitle";
import type { ComposerAttachment, ComposerScope } from "@/shared/types";

export function useAttachPost(scope: ComposerScope) {
  const attachments = useUiStore((s) => s.composerAttachments[scope]);
  const addAttachment = useUiStore((s) => s.addComposerAttachment);

  const { data: posts = [] } = usePosts();

  const attachablePosts = useMemo(
    () => posts.filter((p) => p.status === "published" || p.status === "scheduled"),
    [posts],
  );

  const attachPost = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const att: ComposerAttachment = {
        id: `post-${postId}-${attachments.length}`,
        kind: "post",
        postId,
        title: postTitle(post),
      };
      addAttachment(scope, att);
    },
    [addAttachment, attachments.length, posts, scope],
  );

  const attachedPosts = useMemo(() => {
    const postIds = new Set(
      attachments
        .filter((a): a is Extract<ComposerAttachment, { kind: "post" }> => a.kind === "post")
        .map((a) => a.postId),
    );
    return attachablePosts.filter((p) => postIds.has(p.id));
  }, [attachments, attachablePosts]);

  return { attachments, attachablePosts, attachedPosts, attachPost };
}
