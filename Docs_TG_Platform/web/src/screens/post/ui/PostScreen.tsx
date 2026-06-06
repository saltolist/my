"use client";

import { PostCommentsPanel, usePostWorkspace } from "@/widgets/post-workspace";
import { PageHeaderMenuButton } from "@/widgets/page-header";
import { PostStatusBadge } from "@/entities/post";
import PostScreenHeader from "@/screens/post/ui/PostScreenHeader";
import PostChatView from "@/screens/post/ui/PostChatView";
import PostChatsView from "@/screens/post/ui/PostChatsView";
import PostNotesView from "@/screens/post/ui/PostNotesView";

export default function PostScreen() {
  const { data, ui, actions } = usePostWorkspace();

  if (!data.post) {
    return (
      <div className="post-hdr">
        <div className="post-hdr-top">
          <div className="page-header-left">
            <PageHeaderMenuButton />
            <button
              className="btn btn-ghost btn-sm page-header-back-btn"
              onClick={() => actions.navigateBack("feed")}
              type="button"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const post = data.post;

  return (
    <div className={`post-screen-wrap${ui.layoutClassName}`} style={ui.layoutStyle}>
      <PostScreenHeader
        {...ui.postHeader}
        post={post}
        activeChat={data.activeChat}
        ctxItems={ui.ctxItems}
        ctxModal={ui.ctxModal}
        isMobile={ui.isMobile}
        onNavigateFeed={() => actions.navigate("feed")}
        onOpenPostView={actions.openPostView}
        onResetToPostChatRoot={actions.resetToPostChatRoot}
        onGoToPostNotes={actions.goToPostNotes}
        onGoToPostChats={actions.goToPostChats}
        onBack={actions.handleBack}
      />
      {data.postMode === "chat" ? (
        <PostChatView post={post} data={data} ui={ui} actions={actions} />
      ) : data.postMode === "chats" ? (
        <PostChatsView post={post} ui={ui} actions={actions} />
      ) : data.postMode === "comments" ? (
        <PostCommentsPanel
          post={post}
          search={ui.listSearch}
          postCardRef={ui.postCardRef}
          badge={<PostStatusBadge post={post} />}
          metrics={post.status === "published" && post.metrics ? post.metrics : null}
          media={data.mediaItems}
          phoneFormat={ui.phoneFormat}
        />
      ) : (
        <PostNotesView post={post} ui={ui} actions={actions} />
      )}
    </div>
  );
}
