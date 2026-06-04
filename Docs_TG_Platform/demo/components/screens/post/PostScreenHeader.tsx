"use client";

import { postTitle } from "@/lib/helpers";
import PageHeaderSearchInput, {
  PageHeaderSearchMagnifier,
} from "@/components/PageHeaderSearchInput";
import PageHeaderMenuButton from "@/components/PageHeaderMenuButton";
import PageHeaderOverflow from "@/components/PageHeaderOverflow";
import { ContextMenu, type CtxMenuItem } from "@/components/ContextMenu";
import type { PostWorkspace } from "@/lib/hooks/usePostWorkspace";
import type { LocalChat } from "@/lib/types";

type Props = Pick<
  PostWorkspace,
  | "postMode"
  | "currentPostChatId"
  | "postSubPage"
  | "showListHeaderSearch"
  | "listSearchPlaceholder"
  | "postIntermediateCrumb"
  | "showJump"
  | "postHeaderOverflowItems"
  | "ctxItems"
  | "ctxModal"
  | "isMobile"
  | "postHeaderCompact"
  | "postHeaderCompact1000"
  | "showPostModeButtons"
  | "showPostMobileRight"
  | "showPostTabletOverflow"
  | "showPostTabletSearchToggle"
  | "showPostTabletCompactRight"
  | "hasPostMobileTrailing"
  | "listSearch"
  | "setListSearch"
  | "mobileSearchOpen"
  | "setMobileSearchOpen"
  | "postHdrTopRef"
  | "mobileSearchLeftRef"
  | "postOverflowWrapRef"
  | "postHeaderRightRef"
  | "mobileSearchInputRef"
  | "mobileSearchWrapRef"
  | "navigate"
  | "goToPostNotes"
  | "goToPostChats"
  | "openPostView"
  | "handleBack"
  | "scrollToPost"
  | "resetToPostChatRoot"
> & {
  post: NonNullable<PostWorkspace["post"]>;
  activeChat: LocalChat | null;
};

export default function PostScreenHeader({
  post,
  postMode,
  currentPostChatId,
  activeChat,
  postSubPage,
  showListHeaderSearch,
  listSearchPlaceholder,
  postIntermediateCrumb,
  showJump,
  postHeaderOverflowItems,
  ctxItems,
  ctxModal,
  isMobile,
  postHeaderCompact,
  showPostModeButtons,
  showPostMobileRight,
  showPostTabletOverflow,
  showPostTabletSearchToggle,
  showPostTabletCompactRight,
  hasPostMobileTrailing,
  listSearch,
  setListSearch,
  mobileSearchOpen,
  setMobileSearchOpen,
  postHdrTopRef,
  mobileSearchLeftRef,
  postOverflowWrapRef,
  postHeaderRightRef,
  mobileSearchInputRef,
  mobileSearchWrapRef,
  navigate,
  goToPostNotes,
  goToPostChats,
  openPostView,
  handleBack,
  scrollToPost,
  resetToPostChatRoot,
}: Props) {
  return (
    <div
      className={`post-hdr${
        showListHeaderSearch
          ? postHeaderCompact
            ? ` post-hdr--with-search-mobile${mobileSearchOpen ? " post-hdr--search-open" : ""}`
            : " post-hdr--with-search"
          : ""
      }`}
    >
      <div className="post-hdr-top" ref={postHdrTopRef}>
        <div className="page-header-left" ref={mobileSearchLeftRef}>
          <PageHeaderMenuButton />
          {!(postHeaderCompact && mobileSearchOpen) ? (
            <div className="breadcrumb">
              <span className="bc-link" onClick={() => navigate("feed")}>
                Лента
              </span>
              <span className="bc-sep">/</span>
              {postSubPage ? (
                <>
                  <span className="bc-link bc-post-title" onClick={openPostView}>
                    {postIntermediateCrumb}
                  </span>
                  <span className="bc-sep">/</span>
                  <span className="crumb-current">{postSubPage}</span>
                </>
              ) : postMode === "chat" && currentPostChatId != null && activeChat ? (
                <>
                  <span className="bc-link bc-post-title" onClick={resetToPostChatRoot}>
                    {postIntermediateCrumb}
                  </span>
                  <span className="bc-sep">/</span>
                  <span className="crumb-current">{activeChat.title}</span>
                </>
              ) : (
                <span className="crumb-current bc-post-title">{postTitle(post)}</span>
              )}
            </div>
          ) : null}
        </div>
        {showListHeaderSearch && postHeaderCompact && mobileSearchOpen ? (
          <>
            <div className="post-header-search-expand" ref={mobileSearchWrapRef}>
              <PageHeaderSearchInput
                autoFocus
                placeholder={listSearchPlaceholder}
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                aria-label={listSearchPlaceholder}
                inputRef={mobileSearchInputRef}
                onDismiss={() => setMobileSearchOpen(false)}
                dismissAlways
              />
            </div>
            <div className="page-header-search-spacer" aria-hidden />
          </>
        ) : null}
        {showListHeaderSearch && !postHeaderCompact ? (
          <div className="page-header-center">
            <div className="post-header-search-row">
              <PageHeaderSearchInput
                placeholder={listSearchPlaceholder}
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                onDismiss={() => setListSearch("")}
              />
            </div>
          </div>
        ) : null}
        <div
          ref={postHeaderRightRef}
          className={`page-header-right${
            showPostMobileRight || showPostTabletCompactRight || showPostTabletOverflow
              ? " page-header-right--mobile"
              : ""
          }${showJump ? " post-hdr-has-reveal" : ""}`}
        >
          {!isMobile ? (
            <div className="page-header-actions--desktop">
              {showPostTabletSearchToggle ? (
                <button
                  type="button"
                  className="post-header-search-toggle"
                  aria-label={listSearchPlaceholder}
                  aria-expanded={false}
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <PageHeaderSearchMagnifier size={20} />
                </button>
              ) : showPostTabletCompactRight && mobileSearchOpen ? (
                <span className="page-header-search-toggle-slot" aria-hidden />
              ) : null}
              <button
                className={`jump-post-btn${showJump ? " visible" : ""}`}
                onClick={scrollToPost}
                type="button"
              >
                ↑ К посту
              </button>
              {showPostModeButtons ? (
                <>
                  <div className="post-mode-cluster">
                    <button
                      className={`btn btn-ghost btn-sm post-mode-btn${postMode === "notes" ? " active" : ""}`}
                      onClick={goToPostNotes}
                      type="button"
                    >
                      Заметки
                    </button>
                  </div>
                  <div className="post-mode-cluster">
                    <button
                      className={`btn btn-ghost btn-sm post-mode-btn${postMode === "chats" ? " active" : ""}`}
                      onClick={goToPostChats}
                      type="button"
                    >
                      Чаты
                    </button>
                  </div>
                </>
              ) : null}
              <button className="btn btn-ghost btn-sm post-back-btn" onClick={handleBack} type="button">
                ← Назад
              </button>
              {showPostModeButtons ? (
                <ContextMenu
                  items={ctxItems as CtxMenuItem[]}
                  portal
                  align="right"
                  dropdownClassName="ctx-dropdown--page-header-control"
                />
              ) : null}
              {showPostTabletOverflow ? (
                <div ref={postOverflowWrapRef}>
                  <PageHeaderOverflow
                    className="page-header-actions--mobile"
                    items={postHeaderOverflowItems}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          {showPostMobileRight ? (
            <>
              {showListHeaderSearch ? (
                mobileSearchOpen ? (
                  hasPostMobileTrailing ? (
                    <span className="page-header-search-toggle-slot" aria-hidden />
                  ) : null
                ) : (
                  <button
                    type="button"
                    className={`post-header-search-toggle${mobileSearchOpen ? " is-active" : ""}`}
                    aria-label={listSearchPlaceholder}
                    aria-expanded={mobileSearchOpen}
                    onClick={() => setMobileSearchOpen((open) => !open)}
                  >
                    <PageHeaderSearchMagnifier size={20} />
                  </button>
                )
              ) : null}
              {hasPostMobileTrailing ? (
                <div ref={postOverflowWrapRef}>
                  <PageHeaderOverflow
                    className="page-header-actions--mobile"
                    items={postHeaderOverflowItems}
                  />
                </div>
              ) : null}
            </>
          ) : null}
          {ctxModal}
        </div>
      </div>
    </div>
  );
}
