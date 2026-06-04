"use client";

import { MenuIconPlus } from "@/components/HeaderMenuIcons";
import PostSubpageToolbar from "@/components/post/PostSubpageToolbar";
import PostNotesList from "@/components/screens/post/PostNotesList";
import type { PostWorkspace } from "@/lib/hooks/usePostWorkspace";
import type { LocalNote, Post } from "@/lib/types";

type Props = Pick<
  PostWorkspace,
  | "listSearch"
  | "listContextFilter"
  | "setListContextFilter"
  | "startNewNote"
> & {
  post: Post;
  onOpenNote: (note: LocalNote) => void;
  onToggleNoteAi: (noteId: number) => void;
};

export default function PostNotesView({
  post,
  listSearch,
  listContextFilter,
  setListContextFilter,
  startNewNote,
  onOpenNote,
  onToggleNoteAi,
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
        onOpenNote={onOpenNote}
        onToggleNoteAi={onToggleNoteAi}
      />
    </div>
  );
}
