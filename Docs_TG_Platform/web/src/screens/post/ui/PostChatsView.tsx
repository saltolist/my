"use client";

import { MenuIconPlus } from "@/widgets/page-header";
import { PostSubpageToolbar, type PostWorkspace } from "@/widgets/post-workspace";
import PostChatsList from "@/screens/post/ui/PostChatsList";
import type { Post } from "@/shared/types";

type Props = {
  post: Post;
  ui: Pick<PostWorkspace["ui"], "listSearch" | "listContextFilter" | "setListContextFilter">;
  actions: Pick<PostWorkspace["actions"], "startNewChat" | "openLocalChat">;
};

export default function PostChatsView({ post, ui, actions }: Props) {
  const { listSearch, listContextFilter, setListContextFilter } = ui;
  const { startNewChat, openLocalChat } = actions;

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
