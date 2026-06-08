"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import { usePost } from "@/entities/post/model/usePosts";
import { SchedulePostDialog } from "@/features/schedule-post";
import { useSendPostMessage } from "@/features/send-message";
import { cn } from "@/shared/lib/utils";
import type { PostMode } from "@/shared/types";
import { Card, CardContent } from "@/shared/ui/card";

import { usePostEditState } from "./model/usePostEditState";
import { usePostWorkspaceActions } from "./model/usePostWorkspaceActions";
import { PostInlineEditor } from "./ui/post-inline-editor";
import { PostWorkspaceHeader } from "./ui/post-workspace-header";
import { PostWorkspacePanels } from "./ui/post-workspace-panels";

type PostWorkspaceProps = {
  postId: number;
  onDeleted?: () => void;
  className?: string;
};

export function PostWorkspace({ postId, onDeleted, className }: PostWorkspaceProps) {
  const postCardRef = useRef<HTMLDivElement>(null);
  const { data: post, isLoading } = usePost(postId);
  const sendPostMessage = useSendPostMessage(postId);

  const getMode = usePostNavigationStore((s) => s.getMode);
  const setMode = usePostNavigationStore((s) => s.setMode);
  const getCurrentPostChatId = usePostNavigationStore((s) => s.getCurrentPostChatId);

  const mode = getMode(postId);
  const currentChatId = getCurrentPostChatId(postId);
  const [listSearch, setListSearch] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const {
    isEditing,
    editText,
    editMedia,
    setEditText,
    startEdit,
    finishEdit,
    cancelEdit,
  } = usePostEditState(post);

  const {
    handleSavePost,
    handlePublish,
    handleDelete,
    handleToggleNoteAi,
  } = usePostWorkspaceActions({
    post,
    editText,
    editMedia,
    onSaved: finishEdit,
    onDeleted,
  });

  const activeChat = useMemo(
    () => post?.chats.find((c) => c.id === currentChatId) ?? null,
    [post, currentChatId],
  );

  const handleModeChange = useCallback(
    (nextMode: PostMode) => {
      setMode(postId, nextMode, currentChatId);
      setListSearch("");
    },
    [currentChatId, postId, setMode],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      const result = await sendPostMessage(text, currentChatId);
      if (result && result.chatId != null && currentChatId == null) {
        setMode(postId, "chat", result.chatId);
      }
      return true;
    },
    [currentChatId, postId, sendPostMessage, setMode],
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка поста…</p>;
  }

  if (!post) {
    return <p className="text-sm text-muted-foreground">Пост не найден</p>;
  }

  const showComments = post.status === "published";
  const openChat = (chatId: number | null) => setMode(postId, "chat", chatId);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div ref={postCardRef} className="scroll-mt-4">
        <Card>
          <PostWorkspaceHeader
            post={post}
            mode={mode}
            showComments={showComments}
            showJump={mode !== "chat"}
            onModeChange={handleModeChange}
            onJump={() => postCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            onNewChat={() => openChat(null)}
            onPublish={() => void handlePublish()}
            onSchedule={() => setScheduleOpen(true)}
            onDelete={() => void handleDelete()}
          />
          <CardContent className="flex flex-col gap-3">
            <PostInlineEditor
              post={post}
              isEditing={isEditing}
              editText={editText}
              editMedia={editMedia}
              onEditTextChange={setEditText}
              onStartEdit={startEdit}
              onSave={() => void handleSavePost()}
              onCancel={cancelEdit}
            />
          </CardContent>
        </Card>
      </div>

      <SchedulePostDialog
        postId={postId}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />

      <PostWorkspacePanels
        mode={mode}
        post={post}
        postId={postId}
        currentChatId={currentChatId}
        activeChat={activeChat}
        listSearch={listSearch}
        showComments={showComments}
        onListSearchChange={setListSearch}
        onSelectChat={(chatId) => openChat(chatId)}
        onNewChat={() => openChat(null)}
        onToggleNoteAi={handleToggleNoteAi}
        onCommentsClick={() => handleModeChange("comments")}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
