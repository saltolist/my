"use client";

import { useCallback, useMemo } from "react";

import { usePosts } from "@/entities/post/model/usePosts";
import { useUiStore } from "@/app/model/store/ui-store";
import { postTitle } from "@/shared/lib/postTitle";
import type { ComposerScope, PostMedia } from "@/shared/types";

export type MediaAttachItem = {
  postId: number;
  postTitle: string;
  media: PostMedia;
};

export function useAttachMedia(scope: ComposerScope, currentPostId?: number) {
  const attachments = useUiStore((s) => s.composerAttachments[scope]);
  const addAttachment = useUiStore((s) => s.addComposerAttachment);
  const { data: posts = [] } = usePosts();

  const attachMedia = useCallback(
    (postId: number, mediaName: string) => {
      const post = posts.find((p) => p.id === postId);
      addAttachment(scope, {
        id: `media-${postId}-${mediaName}-${attachments.length}`,
        kind: "media",
        postId,
        postTitle: post ? postTitle(post) : "",
        media: mediaName,
      });
    },
    [addAttachment, attachments.length, posts, scope],
  );

  const currentPostMedia = useMemo((): MediaAttachItem[] => {
    if (currentPostId == null) return [];
    const post = posts.find((p) => p.id === currentPostId);
    if (!post?.media?.length) return [];
    const title = postTitle(post);
    return post.media.map((media) => ({
      postId: currentPostId,
      postTitle: title,
      media,
    }));
  }, [currentPostId, posts]);

  const attachedPostMedia = useMemo((): MediaAttachItem[] => {
    const items: MediaAttachItem[] = [];
    for (const att of attachments) {
      if (att.kind !== "post") continue;
      const post = posts.find((p) => p.id === att.postId);
      if (!post?.media?.length) continue;
      const title = postTitle(post);
      for (const media of post.media) {
        items.push({ postId: att.postId, postTitle: title, media });
      }
    }
    return items;
  }, [attachments, posts]);

  return { attachMedia, currentPostMedia, attachedPostMedia };
}
