"use client";

import { MenuIconPlus } from "@/widgets/page-header";
import { PostSubpageToolbar, type PostWorkspace } from "@/widgets/post-workspace";
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
      <PostSubpageToolbar
        filter={listContextFilter}
        onFilterChange={setListContextFilter}
        action={
          <button
            type="button"
            className="filter-tab filter-tab--action notes-new-note-btn filter-tab--dropdown"
            onClick={startNewNote}
          >
            <span className="notes-new-note-btn-icon" aria-hidden>
              <MenuIconPlus size={12} strokeWidth={2} />
            </span>
            <span>Новая заметка</span>
          </button>
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
