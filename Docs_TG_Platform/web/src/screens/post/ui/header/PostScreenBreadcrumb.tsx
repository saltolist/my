"use client";

import { postTitle } from "@/shared/lib/helpers";
import type { LocalChat, Post, PostMode } from "@/shared/types";

type Props = {
  post: Post;
  postMode: PostMode;
  currentPostChatId: number | null;
  activeChat: LocalChat | null;
  postSubPage: string | null;
  postIntermediateCrumb: string;
  onNavigateFeed: () => void;
  onOpenPostView: () => void;
  onResetToPostChatRoot: () => void;
};

export default function PostScreenBreadcrumb({
  post,
  postMode,
  currentPostChatId,
  activeChat,
  postSubPage,
  postIntermediateCrumb,
  onNavigateFeed,
  onOpenPostView,
  onResetToPostChatRoot,
}: Props) {
  return (
    <div className="breadcrumb">
      <span className="bc-link" onClick={onNavigateFeed}>
        Лента
      </span>
      <span className="bc-sep">/</span>
      {postSubPage ? (
        <>
          <span className="bc-link bc-post-title" onClick={onOpenPostView}>
            {postIntermediateCrumb}
          </span>
          <span className="bc-sep">/</span>
          <span className="crumb-current">{postSubPage}</span>
        </>
      ) : postMode === "chat" && currentPostChatId != null && activeChat ? (
        <>
          <span className="bc-link bc-post-title" onClick={onResetToPostChatRoot}>
            {postIntermediateCrumb}
          </span>
          <span className="bc-sep">/</span>
          <span className="crumb-current">{activeChat.title}</span>
        </>
      ) : (
        <span className="crumb-current bc-post-title">{postTitle(post)}</span>
      )}
    </div>
  );
}
