"use client";

import { MenuIconPlus } from "@/components/HeaderMenuIcons";
import PostSubpageToolbar from "@/components/post/PostSubpageToolbar";
import PostChatsList from "@/components/screens/post/PostChatsList";
import type { PostWorkspace } from "@/lib/hooks/usePostWorkspace";
import type { Post } from "@/lib/types";

type Props = Pick<
  PostWorkspace,
  | "listSearch"
  | "listContextFilter"
  | "setListContextFilter"
  | "startNewChat"
  | "openLocalChat"
> & {
  post: Post;
};

export default function PostChatsView({
  post,
  listSearch,
  listContextFilter,
  setListContextFilter,
  startNewChat,
  openLocalChat,
}: Props) {
  return (
    <div className="post-subpage-scroll">
      <PostSubpageToolbar
        filter={listContextFilter}
        onFilterChange={setListContextFilter}
        action={
          <button
            type="button"
            className="filter-tab filter-tab--action chats-new-chat-btn filter-tab--dropdown"
            onClick={startNewChat}
          >
            <span className="chats-new-chat-btn-icon" aria-hidden>
              <MenuIconPlus size={12} strokeWidth={2} />
            </span>
            <span>Новый чат</span>
          </button>
        }
      />
      <PostChatsList
        post={post}
        search={listSearch}
        contextFilter={listContextFilter}
        onOpenChat={openLocalChat}
      />
    </div>
  );
}
