"use client";

import { useCallback } from "react";
import { useApp } from "@/state/AppContext";
import { usePostWorkspace } from "@/lib/hooks/usePostWorkspace";
import { routes } from "@/lib/routes";
import PageHeaderMenuButton from "@/components/PageHeaderMenuButton";
import PostCommentsPanel from "@/components/post/PostCommentsPanel";
import { PostStatusBadge } from "@/components/post/PostStatusBadge";
import PostScreenHeader from "@/components/screens/post/PostScreenHeader";
import PostChatView from "@/components/screens/post/PostChatView";
import PostChatsView from "@/components/screens/post/PostChatsView";
import PostNotesView from "@/components/screens/post/PostNotesView";
import type { LocalNote } from "@/lib/types";

export default function PostScreen() {
  const ws = usePostWorkspace();
  const { dispatch, goToHref } = useApp();

  const onOpenNote = useCallback(
    (note: LocalNote) => {
      if (!ws.post) return;
      goToHref(routes.notePost(ws.post.id, note.id));
    },
    [goToHref, ws.post],
  );

  const onToggleNoteAi = useCallback(
    (noteId: number) => {
      if (!ws.post) return;
      dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: ws.post.id, noteId });
    },
    [dispatch, ws.post],
  );

  if (!ws.post) {
    return (
      <div className="post-hdr">
        <div className="post-hdr-top">
          <div className="page-header-left">
            <PageHeaderMenuButton />
            <button
              className="btn btn-ghost btn-sm page-header-back-btn"
              onClick={() => ws.navigateBack("feed")}
              type="button"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const post = ws.post;

  return (
    <div className={`post-screen-wrap${ws.layoutClassName}`} style={ws.layoutStyle}>
      <PostScreenHeader {...ws} post={post} activeChat={ws.activeChat} />
      {ws.postMode === "chat" ? (
        <PostChatView {...ws} post={post} />
      ) : ws.postMode === "chats" ? (
        <PostChatsView {...ws} post={post} />
      ) : ws.postMode === "comments" ? (
        <PostCommentsPanel
          post={post}
          search={ws.listSearch}
          postCardRef={ws.postCardRef}
          badge={<PostStatusBadge post={post} />}
          metrics={post.status === "published" && post.metrics ? post.metrics : null}
          media={ws.mediaItems}
          phoneFormat={ws.phoneFormat}
        />
      ) : (
        <PostNotesView
          {...ws}
          post={post}
          onOpenNote={onOpenNote}
          onToggleNoteAi={onToggleNoteAi}
        />
      )}
    </div>
  );
}
