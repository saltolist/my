"use client";

import { NoteListCard, NoteListCardMenu } from "@/widgets/note-editor";
import type { AnyNote } from "@/screens/notes/model/useNotesScreen";

type Props = {
  notes: AnyNote[];
  emptyLabel: string;
  onOpen: (n: AnyNote) => void;
  onToggleAi: (n: AnyNote) => void;
};

export default function NotesMobileGrid({ notes, emptyLabel, onOpen, onToggleAi }: Props) {
  return (
    <div className="notes-grid notes-grid--screen visible">
      <div className="notes-grid-inner">
        {notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>{emptyLabel}</p>
          </div>
        ) : (
          notes.map((n) => (
            <NoteListCard
              key={`${n.isGlobal ? "g" : `l-${n.postId}`}-${n.id}`}
              title={n.title}
              body={n.body}
              meta={`${n.date} · ${n.isGlobal ? "Глобальная" : "Локальная"}`}
              ai={n.ai}
              onClick={() => onOpen(n)}
              onToggleAi={() => onToggleAi(n)}
              menu={
                n.isGlobal ? (
                  <NoteListCardMenu isGlobal noteId={n.id} title={n.title} />
                ) : (
                  <NoteListCardMenu
                    isGlobal={false}
                    postId={n.postId}
                    noteId={n.id}
                    title={n.title}
                  />
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
