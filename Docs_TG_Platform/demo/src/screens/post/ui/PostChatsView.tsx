"use client";

import { MenuIconPlus } from "@/widgets/page-header/ui/HeaderMenuIcons";
import PostSubpageToolbar from "@/widgets/post-workspace/ui/PostSubpageToolbar";
import PostChatsList from "@/screens/post/ui/PostChatsList";
import type { PostWorkspace } from "@/widgets/post-workspace/model/usePostWorkspace";
import type { Post } from "@/shared/types";

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
