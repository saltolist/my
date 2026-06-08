"use client";

import { PostStatusBadge } from "@/entities/post";
import { PostJumpButton, PostModeSwitch } from "@/widgets/page-header";
import { postTitle } from "@/shared/lib/postTitle";
import { Badge } from "@/shared/ui/badge";
import { CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import type { Post, PostMode } from "@/shared/types";

import { PostContextMenu } from "./post-context-menu";

export type PostWorkspaceHeaderProps = {
  post: Post;
  mode: PostMode;
  showComments?: boolean;
  showJump?: boolean;
  onModeChange: (mode: PostMode) => void;
  onJump: () => void;
  onNewChat?: () => void;
  onNewNote?: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onDelete: () => void;
  className?: string;
};

export function PostWorkspaceHeader({
  post,
  mode,
  showComments = false,
  showJump = false,
  onModeChange,
  onJump,
  onNewChat,
  onNewNote,
  onPublish,
  onSchedule,
  onDelete,
  className,
}: PostWorkspaceHeaderProps) {
  return (
    <CardHeader className={cn("flex flex-col gap-3 space-y-0", className)}>
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <CardTitle className="truncate">{postTitle(post)}</CardTitle>
          <PostStatusBadge post={post} />
          {post.rubric ? <Badge variant="outline">{post.rubric}</Badge> : null}
        </div>
        <PostContextMenu
          post={post}
          onPublish={onPublish}
          onSchedule={onSchedule}
          onDelete={onDelete}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PostModeSwitch
          mode={mode}
          showComments={showComments}
          onModeChange={onModeChange}
          onNewChat={onNewChat}
          onNewNote={onNewNote}
          className="min-w-0 flex-1"
        />
        <PostJumpButton onClick={onJump} visible={showJump} />
      </div>
    </CardHeader>
  );
}
