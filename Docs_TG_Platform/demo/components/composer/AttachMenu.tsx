"use client";

import { createPortal } from "react-dom";
import { useAttachMenu } from "@/lib/hooks/useAttachMenu";
import { postTitle } from "@/lib/helpers";
import type { ComposerAttachment } from "@/lib/types";
import AttachHomeScopeMenu from "./AttachHomeScopeMenu";
import AttachPostScopeMenu from "./AttachPostScopeMenu";
import type { AttachScope } from "@/lib/hooks/useAttachMenu";

export type { AttachScope };

type Props = {
  scope: AttachScope;
  onAttach: (att: ComposerAttachment) => void;
  placement?: "up" | "down";
  attachments?: ComposerAttachment[];
};

export default function AttachMenu(props: Props) {
  const menu = useAttachMenu(props);

  const dropdownContent =
    menu.open && menu.scope !== "feed" && menu.pos ? (
      <div
        ref={menu.dropdownRef}
        className={`ctx-dropdown attach-dropdown open attach-dropdown-${menu.pos.mode}`}
        style={
          menu.pos.mode === "down"
            ? { top: menu.pos.top, left: menu.pos.left }
            : { bottom: menu.pos.bottom, left: menu.pos.left }
        }
      >
        {menu.scope === "post" ? (
          <AttachPostScopeMenu
            submenu={menu.submenu}
            setSubmenu={menu.setSubmenu}
            media={menu.postMedia}
            postTitleText={menu.currentPost ? postTitle(menu.currentPost) : ""}
            attachedMedia={menu.attachedPostsMedia}
            hasAttachedPosts={menu.attachedPostIds.length > 0}
            onPickMedia={(media) => menu.attachMediaFromPost(media.name)}
            onPickAttachedMedia={menu.attachMediaFromPinned}
            onPickFile={menu.pickFile}
          />
        ) : (
          <AttachHomeScopeMenu
            submenu={menu.submenu}
            setSubmenu={menu.setSubmenu}
            attachedMedia={menu.attachedPostsMedia}
            hasAttachedPosts={menu.attachedPostIds.length > 0}
            onPickAttachedMedia={menu.attachMediaFromPinned}
            onPickFile={menu.pickFile}
          />
        )}
      </div>
    ) : null;

  return (
    <div className="ctx-wrap attach-wrap" ref={menu.wrapRef}>
      <button
        ref={menu.btnRef}
        className="icon-btn attach-btn"
        title="Добавить"
        type="button"
        onClick={menu.onTriggerClick}
        aria-label="Добавить"
      >
        <svg
          className="attach-btn-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="file"
        ref={menu.fileInputRef}
        style={{ display: "none" }}
        onChange={menu.onFilePicked}
      />
      {dropdownContent && typeof document !== "undefined"
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
