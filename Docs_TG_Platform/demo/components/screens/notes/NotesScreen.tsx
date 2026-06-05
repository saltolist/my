"use client";

import NotesDesktopGrid from "@/components/screens/notes/NotesDesktopGrid";
import NotesFilterRow from "@/components/screens/notes/NotesFilterRow";
import NotesMobileGrid from "@/components/screens/notes/NotesMobileGrid";
import NotesScreenHeader from "@/components/screens/notes/NotesScreenHeader";
import { useNotesScreen } from "@/lib/hooks/useNotesScreen";

export default function NotesScreen() {
  const notes = useNotesScreen();
  const gridProps = {
    notes: notes.filtered,
    emptyLabel: notes.emptyLabel,
    onOpen: notes.openNote,
    onToggleAi: notes.toggleAi,
  };

  return (
    <>
      <NotesScreenHeader {...notes} />
      <div className="notes-page">
        <NotesFilterRow {...notes} />
        <div className="notes-grid-page">
          {notes.isMobile ? (
            <NotesMobileGrid {...gridProps} />
          ) : (
            <NotesDesktopGrid {...gridProps} />
          )}
        </div>
      </div>
    </>
  );
}
