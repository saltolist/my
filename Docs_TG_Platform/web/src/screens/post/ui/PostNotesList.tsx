"use client";

import { EmptyState } from "@/shared/ui/empty-state";
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
          <EmptyState icon="📝" message="Нет заметок для этого поста" />
        ) : notes.length === 0 ? (
          <EmptyState
            icon="📝"
            message={contextFilter === "all" ? "Ничего не найдено" : "Нет заметок по фильтру"}
          />
        ) : null}
        {notes.map((n) => (
          <div key={n.id} className="note-card" onClick={() => onOpenNote(n)}>
            <div className="note-card-body">
              <div className="note-card-title">{n.title}</div>
              <div className="note-card-preview-post">{n.body}</div>
              <div className="note-card-footer">
                <div className="note-card-footer-start">
                  <button
                    type="button"
                    className={`note-ai-toggle${n.ai ? " on" : " off"}`}
                    aria-pressed={n.ai}
                    title={n.ai ? "В контексте ИИ" : "Вне контекста ИИ"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleNoteAi(n.id);
                    }}
                  >
                    AI
                  </button>
                  <span className="note-card-meta">{n.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
