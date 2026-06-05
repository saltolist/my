"use client";

import { Composer } from "@/widgets/composer";
import { ChatMessage } from "@/widgets/chat-thread";
import { PostMessageCard, type PostWorkspace } from "@/widgets/post-workspace";
import { PostStatusBadge } from "@/entities/post";
import type { Post } from "@/shared/types";

type Props = Pick<
  PostWorkspace,
  | "isEditing"
  | "mediaItems"
  | "phoneFormat"
  | "flatMessages"
  | "lastAssistantFlat"
  | "activeChat"
  | "chatScrollRef"
  | "postCardRef"
  | "startEdit"
  | "cancelEdit"
  | "savePost"
  | "openComments"
  | "sendPost"
> & {
  post: Post;
};

export default function PostChatView({
  post,
  isEditing,
  mediaItems,
  phoneFormat,
  flatMessages,
  lastAssistantFlat,
  activeChat,
  chatScrollRef,
  postCardRef,
  startEdit,
  cancelEdit,
  savePost,
  openComments,
  sendPost,
}: Props) {
  return (
    <>
      <div className="composer-scroll-wrap">
        <div className="post-body" ref={chatScrollRef}>
          <div className="composer-scroll-body">
            <div className="post-body-inner">
              <PostMessageCard
                cardRef={postCardRef}
                isEditing={isEditing}
                text={post.text}
                media={mediaItems}
                onStartEdit={startEdit}
                onCancel={cancelEdit}
                onSave={savePost}
                badge={<PostStatusBadge post={post} />}
                metrics={post.status === "published" && post.metrics ? post.metrics : null}
                comments={post.status === "published" ? (post.comments ?? []) : undefined}
                onOpenComments={openComments}
                isTextOnlyNoMedia={
                  mediaItems.length === 0 &&
                  (post.status === "published" ||
                    post.status === "scheduled" ||
                    post.status === "draft")
                }
                phoneFormat={phoneFormat}
              />
              {flatMessages.map(({ message: m, path }, i) => (
                <ChatMessage
                  key={path.join("-")}
                  message={m}
                  ctx={{
                    scope: "post",
                    postId: post.id,
                    entityId: activeChat?.id ?? 0,
                    path,
                  }}
                  isLastAssistantMessage={m.role === "ai" && i === lastAssistantFlat}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Composer scope="post" onSubmit={sendPost} />
    </>
  );
}
