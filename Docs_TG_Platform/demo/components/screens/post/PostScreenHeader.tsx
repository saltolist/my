"use client";

import PageHeaderMenuButton from "@/components/PageHeaderMenuButton";
import PostScreenBreadcrumb from "@/components/screens/post/header/PostScreenBreadcrumb";
import PostScreenHeaderDesktopActions from "@/components/screens/post/header/PostScreenHeaderDesktopActions";
import PostScreenHeaderMobileActions from "@/components/screens/post/header/PostScreenHeaderMobileActions";
import PostScreenHeaderSearch from "@/components/screens/post/header/PostScreenHeaderSearch";
import type { CtxMenuItem } from "@/components/ContextMenu";
import type { PostScreenHeaderState } from "@/lib/hooks/usePostScreenHeader";
import type { LocalChat, Post } from "@/lib/types";
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
  rootClassName,
  rightClassName,
  postHdrTopRef,
  mobileSearchLeftRef,
  postHeaderRightRef,
  postHeaderCompact,
  mobileSearchOpen,
  showListHeaderSearch,
  postSubPage,
  postIntermediateCrumb,
  postMode,
  currentPostChatId,
  listSearchPlaceholder,
  listSearch,
  setListSearch,
  setMobileSearchOpen,
  mobileSearchWrapRef,
  mobileSearchInputRef,
  showJump,
  showPostModeButtons,
  showPostMobileRight,
  showPostTabletOverflow,
  showPostTabletSearchToggle,
  showPostTabletCompactRight,
  hasPostMobileTrailing,
  postHeaderOverflowItems,
  postOverflowWrapRef,
  scrollToPost,
  onNavigateFeed,
  onOpenPostView,
  onResetToPostChatRoot,
  onGoToPostNotes,
  onGoToPostChats,
  onBack,
}: Props) {
  const hideBreadcrumb = postHeaderCompact && mobileSearchOpen;

  return (
    <div className={rootClassName}>
      <div className="post-hdr-top" ref={postHdrTopRef}>
        <div className="page-header-left" ref={mobileSearchLeftRef}>
          <PageHeaderMenuButton />
          {!hideBreadcrumb ? (
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
          ) : null}
        </div>
        <PostScreenHeaderSearch
          postHeaderCompact={postHeaderCompact}
          mobileSearchOpen={mobileSearchOpen}
          showListHeaderSearch={showListHeaderSearch}
          listSearchPlaceholder={listSearchPlaceholder}
          listSearch={listSearch}
          setListSearch={setListSearch}
          setMobileSearchOpen={setMobileSearchOpen}
          mobileSearchWrapRef={mobileSearchWrapRef}
          mobileSearchInputRef={mobileSearchInputRef}
        />
        <div ref={postHeaderRightRef} className={rightClassName}>
          {!isMobile ? (
            <PostScreenHeaderDesktopActions
              postMode={postMode}
              showJump={showJump}
              showPostModeButtons={showPostModeButtons}
              showPostTabletSearchToggle={showPostTabletSearchToggle}
              showPostTabletCompactRight={showPostTabletCompactRight}
              showPostTabletOverflow={showPostTabletOverflow}
              mobileSearchOpen={mobileSearchOpen}
              listSearchPlaceholder={listSearchPlaceholder}
              postHeaderOverflowItems={postHeaderOverflowItems}
              ctxItems={ctxItems}
              postOverflowWrapRef={postOverflowWrapRef}
              onScrollToPost={scrollToPost}
              onGoToPostNotes={onGoToPostNotes}
              onGoToPostChats={onGoToPostChats}
              onBack={onBack}
              onOpenMobileSearch={() => setMobileSearchOpen(true)}
            />
          ) : null}
          {showPostMobileRight ? (
            <PostScreenHeaderMobileActions
              showListHeaderSearch={showListHeaderSearch}
              mobileSearchOpen={mobileSearchOpen}
              hasPostMobileTrailing={hasPostMobileTrailing}
              listSearchPlaceholder={listSearchPlaceholder}
              postHeaderOverflowItems={postHeaderOverflowItems}
              postOverflowWrapRef={postOverflowWrapRef}
              onToggleMobileSearch={() => setMobileSearchOpen((open) => !open)}
            />
          ) : null}
          {ctxModal}
        </div>
      </div>
    </div>
  );
}
