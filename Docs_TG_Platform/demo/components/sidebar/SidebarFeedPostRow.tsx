"use client";

import { ContextMenu } from "@/components/ContextMenu";
import type { CtxMenuItem } from "@/components/ContextMenu";
import { postTitle } from "@/lib/helpers";
import type { Post } from "@/lib/types";

type Props = {
  post: Post;
  isFullActive: boolean;
  isSubActive: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onOpen: () => void;
  menuItems: CtxMenuItem[];
};

export default function SidebarFeedPostRow({
  post,
  isFullActive,
  isSubActive,
  menuOpen,
  onMenuOpenChange,
  onOpen,
  menuItems,
}: Props) {
  return (
    <div className="nav-recent-chats">
      <div
        className={`nav-recent-chat-row${isFullActive ? " active" : isSubActive ? " sub-active" : ""}${
          menuOpen ? " nav-recent-chat-row--menu" : ""
        }`}
      >
        <button type="button" className="nav-recent-chat" onClick={onOpen}>
          <span className="nav-recent-chat-title">{postTitle(post)}</span>
        </button>
        <ContextMenu
          className="nav-recent-chat-ctx"
          align="left"
          portal
          onOpenChange={onMenuOpenChange}
          trigger={<span className="nav-recent-chat-dots">⋯</span>}
          items={menuItems}
        />
      </div>
    </div>
  );
}
