"use client";

import PostScreenBreadcrumb from "@/screens/post/ui/header/PostScreenBreadcrumb";
import PostHeaderDesktopActions from "@/screens/post/ui/header/PostHeaderDesktopActions";
import { PageHeader, PageHeaderSearchInput } from "@/widgets/page-header";
import type { PostScreenHeaderState } from "@/widgets/post-workspace";
import type { CtxMenuItem } from "@/shared/ui/context-menu";
import type { LocalChat, Post } from "@/shared/types";
import type { ReactNode } from "react";

type Props = PostScreenHeaderState & {
  post: Post;
  activeChat: LocalChat | null;
  ctxItems: CtxMenuItem[];
  ctxModal: ReactNode;
  isMobile: boolean;
  onNavigateFeed: () => void;
  onOpenPostView: () => void;
  onResetToPostChatRoot: () => void;
  onGoToPostNotes: () => void;
  onGoToPostChats: () => void;
  onBack: () => void;
};

export default function PostScreenHeader({
  post,
  activeChat,
  ctxItems,
  ctxModal,
  isMobile,
  postSubPage,
  postIntermediateCrumb,
  showListHeaderSearch,
  listSearchPlaceholder,
  listSearch,
  setListSearch,
  showJump,
  showPostModeButtons,
  showPostTabletOverflow,
  postHeaderOverflowItems,
  postMode,
  currentPostChatId,
  scrollToPost,
  onNavigateFeed,
  onOpenPostView,
  onResetToPostChatRoot,
  onGoToPostNotes,
  onGoToPostChats,
  onBack,
}: Props) {
  const headerClassName = [
    "page-header--post",
    showListHeaderSearch && "page-header--post-with-search",
    showJump && "page-header--post-has-jump",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PageHeader
        className={headerClassName}
        left={
          <PostScreenBreadcrumb
            post={post}
            postMode={postMode}
            currentPostChatId={currentPostChatId}
            activeChat={activeChat}
            postSubPage={postSubPage}
            postIntermediateCrumb={postIntermediateCrumb}
            onNavigateFeed={onNavigateFeed}
            onOpenPostView={onOpenPostView}
            onResetToPostChatRoot={onResetToPostChatRoot}
          />
        }
        search={
          showListHeaderSearch ? (
            <div className="post-header-search-row">
              <PageHeaderSearchInput
                placeholder={listSearchPlaceholder}
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                onDismiss={() => setListSearch("")}
              />
            </div>
          ) : undefined
        }
        compactSearchAtWidth={showListHeaderSearch ? 1200 : undefined}
        compactSearchOverlay={showListHeaderSearch}
        actions={
          !isMobile ? (
            <PostHeaderDesktopActions
              postMode={postMode}
              showJump={showJump}
              showPostModeButtons={showPostModeButtons}
              ctxItems={ctxItems}
              onScrollToPost={scrollToPost}
              onGoToPostNotes={onGoToPostNotes}
              onGoToPostChats={onGoToPostChats}
              onBack={onBack}
            />
          ) : undefined
        }
        overflowItems={
          isMobile || showPostTabletOverflow ? postHeaderOverflowItems : undefined
        }
      />
      {ctxModal}
    </>
  );
}
