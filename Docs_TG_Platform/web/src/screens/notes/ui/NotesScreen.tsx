"use client";

import NotesDesktopGrid from "@/screens/notes/ui/NotesDesktopGrid";
import NotesFilterRow from "@/screens/notes/ui/NotesFilterRow";
import NotesMobileGrid from "@/screens/notes/ui/NotesMobileGrid";
import NotesScreenHeader from "@/screens/notes/ui/NotesScreenHeader";
import { useNotesScreen } from "@/screens/notes/model/useNotesScreen";

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
