"use client";

import { postTitle } from "@/shared/lib/helpers";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
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
  if (postSubPage) {
    return (
      <Breadcrumb
        items={[
          { label: "Лента", onClick: onNavigateFeed },
          { label: postIntermediateCrumb, onClick: onOpenPostView, variant: "title" },
          { label: postSubPage, current: true },
        ]}
      />
    );
  }

  if (postMode === "chat" && currentPostChatId != null && activeChat) {
    return (
      <Breadcrumb
        items={[
          { label: "Лента", onClick: onNavigateFeed },
          { label: postIntermediateCrumb, onClick: onResetToPostChatRoot, variant: "title" },
          { label: activeChat.title, current: true },
        ]}
      />
    );
  }

  return (
    <Breadcrumb
      items={[{ label: "Лента", onClick: onNavigateFeed }, { label: postTitle(post), current: true, variant: "title" }]}
    />
  );
}
