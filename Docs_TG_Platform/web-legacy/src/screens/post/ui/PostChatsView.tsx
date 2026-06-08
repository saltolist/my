"use client";

import { FilterToolbar, FilterToolbarAction } from "@/widgets/filter-toolbar";
import { buildListContextFilterTabs } from "@/shared/lib/listContextFilter";
import { type PostWorkspace } from "@/widgets/post-workspace";
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
      <FilterToolbar
        className="post-subpage-toolbar"
        width="composer"
        tabs={buildListContextFilterTabs(true)}
        mobileTabs={buildListContextFilterTabs(false)}
        value={listContextFilter}
        onChange={setListContextFilter}
        selectClassName="post-list-context-filter-select"
        tabAriaLabel="Фильтр по контексту"
        action={
          <FilterToolbarAction
            label="Новый чат"
            onClick={startNewChat}
            className="filter-tab filter-tab--action chats-new-chat-btn filter-tab--dropdown"
            iconClassName="chats-new-chat-btn-icon"
          />
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
