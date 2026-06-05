"use client";

import NoteListCard from "@/widgets/note-editor/ui/NoteListCard";
import NoteListCardMenu from "@/widgets/note-editor/ui/NoteListCardMenu";
import { matchesListContextFilter } from "@/shared/lib/listContextFilter";
import type { LocalNote, NoteListFilter, Post } from "@/shared/types";

type Props = {
  post: Post;
  search: string;
  contextFilter: NoteListFilter;
  onOpenNote: (note: LocalNote) => void;
  onToggleNoteAi: (noteId: number) => void;
};

export default function PostNotesList({
  post,
  search,
  contextFilter,
  onOpenNote,
  onToggleNoteAi,
}: Props) {
  const q = search.trim().toLowerCase();
  const notes = post.notes.filter((n) => {
    if (!matchesListContextFilter(n.ai, contextFilter)) return false;
    if (!q) return true;
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  return (
    <div id="post-notes" className="notes-grid visible">
      <div className="notes-grid-inner">
        {post.notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>Нет заметок для этого поста</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>{contextFilter === "all" ? "Ничего не найдено" : "Нет заметок по фильтру"}</p>
          </div>
        ) : null}
        {notes.map((n) => (
          <NoteListCard
            key={n.id}
            title={n.title}
            body={n.body}
            meta={n.date}
            ai={n.ai}
            onClick={() => onOpenNote(n)}
            onToggleAi={() => onToggleNoteAi(n.id)}
            menu={
              <NoteListCardMenu isGlobal={false} postId={post.id} noteId={n.id} title={n.title} />
            }
          />
        ))}
      </div>
    </div>
  );
}
