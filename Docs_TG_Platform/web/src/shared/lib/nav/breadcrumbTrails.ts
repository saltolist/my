import { postTitle } from "@/shared/lib/helpers";
import type { BreadcrumbItem } from "@/shared/ui/breadcrumb";
import type { LocalChat, Post, PostMode } from "@/shared/types";

export type PostBreadcrumbTrailContext = {
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

export function buildPostBreadcrumbTrail({
  post,
  postMode,
  currentPostChatId,
  activeChat,
  postSubPage,
  postIntermediateCrumb,
  onNavigateFeed,
  onOpenPostView,
  onResetToPostChatRoot,
}: PostBreadcrumbTrailContext): BreadcrumbItem[] {
  if (postSubPage) {
    return [
      { label: "Лента", onClick: onNavigateFeed },
      { label: postIntermediateCrumb, onClick: onOpenPostView, variant: "title" },
      { label: postSubPage, current: true },
    ];
  }

  if (postMode === "chat" && currentPostChatId != null && activeChat) {
    return [
      { label: "Лента", onClick: onNavigateFeed },
      { label: postIntermediateCrumb, onClick: onResetToPostChatRoot, variant: "title" },
      { label: activeChat.title, current: true },
    ];
  }

  return [
    { label: "Лента", onClick: onNavigateFeed },
    { label: postTitle(post), current: true, variant: "title" },
  ];
}
