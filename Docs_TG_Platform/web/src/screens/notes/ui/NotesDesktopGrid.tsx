"use client";

import { NoteCardAiToggle, NoteListCardMenu } from "@/widgets/note-editor";
import type { AnyNote } from "@/screens/notes/model/useNotesScreen";

type Props = {
  notes: AnyNote[];
  emptyLabel: string;
  onOpen: (n: AnyNote) => void;
  onToggleAi: (n: AnyNote) => void;
};

export default function NotesDesktopGrid({ notes, emptyLabel, onOpen, onToggleAi }: Props) {
  return (
    <div className="notes-grid-layout">
      {notes.length === 0 ? (
        <div className="empty" style={{ gridColumn: "1/-1" }}>
          <div className="eico">📝</div>
          <p>{emptyLabel}</p>
        </div>
      ) : (
        notes.map((n) => (
          <div
            key={`${n.isGlobal ? "g" : `l-${n.postId}`}-${n.id}`}
            className="note-card-page"
            onClick={() => onOpen(n)}
          >
            <div className="note-card-page-head">
              <div className="note-card-name">{n.title}</div>
              <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                {n.isGlobal ? (
                  <NoteListCardMenu isGlobal noteId={n.id} title={n.title} />
                ) : (
                  <NoteListCardMenu
                    isGlobal={false}
                    postId={n.postId}
                    noteId={n.id}
                    title={n.title}
                  />
                )}
              </div>
            </div>
            <div className="note-card-preview">{n.body}</div>
            <div className="note-card-footer-pg">
              <div className="note-card-footer-start">
                <NoteCardAiToggle ai={n.ai} onClick={() => onToggleAi(n)} />
              </div>
              <span className="note-card-meta-pg">
                {n.date} · {n.isGlobal ? "Глобальная" : "Локальная"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
