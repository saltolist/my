"use client";

import { FilterToolbar, FilterToolbarAction } from "@/widgets/filter-toolbar";
import { buildListContextFilterTabs } from "@/shared/lib/listContextFilter";
import { type PostWorkspace } from "@/widgets/post-workspace";
import PostNotesList from "@/screens/post/ui/PostNotesList";
import type { Post } from "@/shared/types";

type Props = {
  post: Post;
  ui: Pick<PostWorkspace["ui"], "listSearch" | "listContextFilter" | "setListContextFilter">;
  actions: Pick<PostWorkspace["actions"], "startNewNote" | "openNote" | "toggleNoteAi">;
};

export default function PostNotesView({ post, ui, actions }: Props) {
  const { listSearch, listContextFilter, setListContextFilter } = ui;
  const { startNewNote, openNote, toggleNoteAi } = actions;

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
            label="Новая заметка"
            onClick={startNewNote}
            className="filter-tab filter-tab--action notes-new-note-btn filter-tab--dropdown"
            iconClassName="notes-new-note-btn-icon"
          />
        }
      />
      <PostNotesList
        post={post}
        search={listSearch}
        contextFilter={listContextFilter}
        onOpenNote={openNote}
        onToggleNoteAi={toggleNoteAi}
      />
    </div>
  );
}
