"use client";

import type { RefObject } from "react";
import { PageHeaderSearchMagnifier } from "@/components/PageHeaderSearchInput";
import PageHeaderOverflow from "@/components/PageHeaderOverflow";
import { ContextMenu, type CtxMenuItem } from "@/components/ContextMenu";
import type { PageHeaderOverflowItem } from "@/components/PageHeaderOverflow";
import type { PostMode } from "@/lib/types";

type Props = {
  postMode: PostMode;
  showJump: boolean;
  showPostModeButtons: boolean;
  showPostTabletSearchToggle: boolean;
  showPostTabletCompactRight: boolean;
  showPostTabletOverflow: boolean;
  mobileSearchOpen: boolean;
  listSearchPlaceholder: string;
  postHeaderOverflowItems: PageHeaderOverflowItem[];
  ctxItems: CtxMenuItem[];
  postOverflowWrapRef: RefObject<HTMLDivElement | null>;
  onScrollToPost: () => void;
  onGoToPostNotes: () => void;
  onGoToPostChats: () => void;
  onBack: () => void;
  onOpenMobileSearch: () => void;
};

export default function PostScreenHeaderDesktopActions({
  postMode,
  showJump,
  showPostModeButtons,
  showPostTabletSearchToggle,
  showPostTabletCompactRight,
  showPostTabletOverflow,
  mobileSearchOpen,
  listSearchPlaceholder,
  postHeaderOverflowItems,
  ctxItems,
  postOverflowWrapRef,
  onScrollToPost,
  onGoToPostNotes,
  onGoToPostChats,
  onBack,
  onOpenMobileSearch,
}: Props) {
  return (
    <div className="page-header-actions--desktop">
      {showPostTabletSearchToggle ? (
        <button
          type="button"
          className="post-header-search-toggle"
          aria-label={listSearchPlaceholder}
          aria-expanded={false}
          onClick={onOpenMobileSearch}
        >
          <PageHeaderSearchMagnifier size={20} />
        </button>
      ) : showPostTabletCompactRight && mobileSearchOpen ? (
        <span className="page-header-search-toggle-slot" aria-hidden />
      ) : null}
      <button
        className={`jump-post-btn${showJump ? " visible" : ""}`}
        onClick={onScrollToPost}
        type="button"
      >
        ↑ К посту
      </button>
      {showPostModeButtons ? (
        <>
          <div className="post-mode-cluster">
            <button
              className={`btn btn-ghost btn-sm post-mode-btn${postMode === "notes" ? " active" : ""}`}
              onClick={onGoToPostNotes}
              type="button"
            >
              Заметки
            </button>
          </div>
          <div className="post-mode-cluster">
            <button
              className={`btn btn-ghost btn-sm post-mode-btn${postMode === "chats" ? " active" : ""}`}
              onClick={onGoToPostChats}
              type="button"
            >
              Чаты
            </button>
          </div>
        </>
      ) : null}
      <button className="btn btn-ghost btn-sm post-back-btn" onClick={onBack} type="button">
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
  );
}
