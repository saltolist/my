import { NoteCard } from "@/entities/note";
import type { LocalNote } from "@/shared/types";

export type LocalNotesGridProps = {
  notes: LocalNote[];
  onToggleAi: (noteId: number) => void;
};

export function LocalNotesGrid({ notes, onToggleAi }: LocalNotesGridProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет заметок к посту</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          variant="local"
          title={note.title}
          body={note.body}
          date={note.date}
          ai={note.ai}
          onToggleAi={() => onToggleAi(note.id)}
        />
      ))}
    </div>
  );
}
