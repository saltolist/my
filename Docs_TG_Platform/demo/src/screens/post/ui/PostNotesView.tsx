"use client";

import { MenuIconPlus } from "@/widgets/page-header/ui/HeaderMenuIcons";
import PostSubpageToolbar from "@/widgets/post-workspace/ui/PostSubpageToolbar";
import PostNotesList from "@/screens/post/ui/PostNotesList";
import type { PostWorkspace } from "@/widgets/post-workspace/model/usePostWorkspace";
import type { Post } from "@/shared/types";

type Props = Pick<
  PostWorkspace,
  | "listSearch"
  | "listContextFilter"
  | "setListContextFilter"
  | "startNewNote"
  | "openNote"
  | "toggleNoteAi"
> & {
  post: Post;
};

export default function PostNotesView({
  post,
  listSearch,
  listContextFilter,
  setListContextFilter,
  startNewNote,
  openNote,
  toggleNoteAi,
}: Props) {
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
