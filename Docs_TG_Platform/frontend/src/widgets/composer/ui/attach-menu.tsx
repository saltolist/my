"use client";

import type { MediaAttachItem } from "@/features/attach-to-message";
import type { ComposerScope, Post } from "@/shared/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";

import { AttachHomeMenu } from "./attach-home-menu";
import { AttachMenuButton } from "./attach-menu-button";
import { AttachPostMenu } from "./attach-post-menu";

export type AttachMenuScope = ComposerScope | "feed";

type AttachMenuProps = {
  scope: AttachMenuScope;
  menuSide: "top" | "bottom";
  attachablePosts: Post[];
  currentPostMedia: MediaAttachItem[];
  attachedPostMedia: MediaAttachItem[];
  onAttachFile: () => void;
  onAttachPost: (postId: number) => void;
  onAttachMedia: (postId: number, mediaName: string) => void;
};

export function AttachMenu({
  scope,
  menuSide,
  attachablePosts,
  currentPostMedia,
  attachedPostMedia,
  onAttachFile,
  onAttachPost,
  onAttachMedia,
}: AttachMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<AttachMenuButton />} />
      <DropdownMenuContent align="start" side={menuSide}>
        {scope === "post" ? (
          <AttachPostMenu
            attachablePosts={attachablePosts}
            currentPostMedia={currentPostMedia}
            attachedPostMedia={attachedPostMedia}
            onAttachFile={onAttachFile}
            onAttachPost={onAttachPost}
            onAttachMedia={onAttachMedia}
          />
        ) : (
          <AttachHomeMenu
            attachablePosts={attachablePosts}
            attachedPostMedia={attachedPostMedia}
            onAttachFile={onAttachFile}
            onAttachPost={onAttachPost}
            onAttachMedia={onAttachMedia}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
