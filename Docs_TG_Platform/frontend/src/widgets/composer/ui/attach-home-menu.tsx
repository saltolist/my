"use client";

import { Paperclip } from "lucide-react";

import type { MediaAttachItem } from "@/features/attach-to-message";
import { postTitle } from "@/shared/lib/postTitle";
import type { Post } from "@/shared/types";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/shared/ui/dropdown-menu";

import { AttachMediaGrid } from "./attach-media-grid";

type AttachHomeMenuProps = {
  attachablePosts: Post[];
  attachedPostMedia: MediaAttachItem[];
  onAttachFile: () => void;
  onAttachPost: (postId: number) => void;
  onAttachMedia: (postId: number, mediaName: string) => void;
};

export function AttachHomeMenu({
  attachablePosts,
  attachedPostMedia,
  onAttachFile,
  onAttachPost,
  onAttachMedia,
}: AttachHomeMenuProps) {
  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Прикрепить пост</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
          {attachablePosts.slice(0, 8).map((post) => (
            <DropdownMenuItem key={post.id} onClick={() => onAttachPost(post.id)}>
              {postTitle(post)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem onClick={onAttachFile}>
        <Paperclip className="size-4" />
        Прикрепить файл
      </DropdownMenuItem>
      {attachedPostMedia.length > 0 ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Медиа из прикреплённых постов</DropdownMenuLabel>
          <AttachMediaGrid items={attachedPostMedia} onSelect={onAttachMedia} />
        </>
      ) : null}
    </>
  );
}
