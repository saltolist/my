import type { PostMode } from "@/lib/types";

export function getPostSubPageLabel(postMode: PostMode): string | null {
  if (postMode === "comments") return "Комментарии";
  if (postMode === "notes") return "Заметки";
  if (postMode === "chats") return "Чаты";
  return null;
}

export function getPostListSearchPlaceholder(postMode: PostMode): string {
  if (postMode === "comments") return "Поиск по комментариям...";
  if (postMode === "notes") return "Поиск по заметкам...";
  return "Поиск по чатам...";
}

export function buildPostHeaderRootClassName(args: {
  showListHeaderSearch: boolean;
  postHeaderCompact: boolean;
  mobileSearchOpen: boolean;
}): string {
  const { showListHeaderSearch, postHeaderCompact, mobileSearchOpen } = args;
  if (!showListHeaderSearch) return "post-hdr";
  if (postHeaderCompact) {
    return `post-hdr post-hdr--with-search-mobile${mobileSearchOpen ? " post-hdr--search-open" : ""}`;
  }
  return "post-hdr post-hdr--with-search";
}

export function buildPostHeaderRightClassName(args: {
  showPostMobileRight: boolean;
  showPostTabletCompactRight: boolean;
  showPostTabletOverflow: boolean;
  showJump: boolean;
}): string {
  const { showPostMobileRight, showPostTabletCompactRight, showPostTabletOverflow, showJump } =
    args;
  let className = "page-header-right";
  if (showPostMobileRight || showPostTabletCompactRight || showPostTabletOverflow) {
    className += " page-header-right--mobile";
  }
  if (showJump) className += " post-hdr-has-reveal";
  return className;
}
