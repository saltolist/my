"use client";

import { PostCommentsPanel, usePostWorkspace } from "@/widgets/post-workspace";
import { PageHeaderMenuButton } from "@/widgets/page-header";
import { PostStatusBadge } from "@/entities/post";
import PostScreenHeader from "@/screens/post/ui/PostScreenHeader";
import PostChatView from "@/screens/post/ui/PostChatView";
import PostChatsView from "@/screens/post/ui/PostChatsView";
import PostNotesView from "@/screens/post/ui/PostNotesView";

export default function PostScreen() {
  const ws = usePostWorkspace();

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
      <PostScreenHeader
        {...ws.postHeader}
        post={post}
        activeChat={ws.activeChat}
        ctxItems={ws.ctxItems}
        ctxModal={ws.ctxModal}
        isMobile={ws.isMobile}
        onNavigateFeed={() => ws.navigate("feed")}
        onOpenPostView={ws.openPostView}
        onResetToPostChatRoot={ws.resetToPostChatRoot}
        onGoToPostNotes={ws.goToPostNotes}
        onGoToPostChats={ws.goToPostChats}
        onBack={ws.handleBack}
      />
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
        <PostNotesView {...ws} post={post} />
      )}
    </div>
  );
}
