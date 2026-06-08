"use client";

import type { LocalChat, Post, PostMode } from "@/shared/types";
import { ChatThread } from "@/widgets/chat-thread";
import { Composer } from "@/widgets/composer";

import { LocalChatsList } from "./local-chats-list";
import { LocalNotesGrid } from "./local-notes-grid";
import { PostCommentsPanel } from "./post-comments-panel";

export type PostWorkspacePanelsProps = {
  mode: PostMode;
  post: Post;
  postId: number;
  currentChatId: number | null;
  activeChat: LocalChat | null;
  listSearch: string;
  showComments: boolean;
  onListSearchChange: (value: string) => void;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onToggleNoteAi: (noteId: number) => void;
  onCommentsClick: () => void;
  onSendMessage: (text: string) => void | boolean | Promise<void | boolean>;
};

export function PostWorkspacePanels({
  mode,
  post,
  postId,
  currentChatId,
  activeChat,
  listSearch,
  showComments,
  onListSearchChange,
  onSelectChat,
  onNewChat,
  onToggleNoteAi,
  onCommentsClick,
  onSendMessage,
}: PostWorkspacePanelsProps) {
  if (mode === "chat") {
    return (
      <div className="flex flex-col gap-4">
        <ChatThread
          history={activeChat?.history ?? []}
          className="max-h-96 rounded-lg border"
        />
        <Composer scope="post" postId={postId} onSubmit={onSendMessage} />
      </div>
    );
  }

  if (mode === "chats") {
    return (
      <LocalChatsList
        chats={post.chats}
        currentChatId={currentChatId}
        search={listSearch}
        onSearchChange={onListSearchChange}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
      />
    );
  }

  if (mode === "notes") {
    return <LocalNotesGrid notes={post.notes} onToggleAi={onToggleNoteAi} />;
  }

  if (mode === "comments" && showComments) {
    return (
      <PostCommentsPanel
        post={post}
        comments={post.comments ?? []}
        onCommentsClick={onCommentsClick}
      />
    );
  }

  return null;
}
