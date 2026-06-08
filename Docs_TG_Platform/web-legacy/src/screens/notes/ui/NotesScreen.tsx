"use client";

import NotesDesktopGrid from "@/screens/notes/ui/NotesDesktopGrid";
import NotesFilterRow from "@/screens/notes/ui/NotesFilterRow";
import NotesMobileGrid from "@/screens/notes/ui/NotesMobileGrid";
import NotesScreenHeader from "@/screens/notes/ui/NotesScreenHeader";
import { useNotesScreen } from "@/screens/notes/model/useNotesScreen";

export default function NotesScreen() {
  const { data, ui, actions } = useNotesScreen();
  const gridProps = {
    notes: data.filtered,
    emptyLabel: data.emptyLabel,
    onOpen: actions.openNote,
    onToggleAi: actions.toggleAi,
  };

  return (
    <>
      <NotesScreenHeader ui={ui} />
      <div className="notes-page">
        <NotesFilterRow data={data} ui={ui} actions={actions} />
        <div className="notes-grid-page">
          {ui.isMobile ? (
            <NotesMobileGrid {...gridProps} />
          ) : (
            <NotesDesktopGrid {...gridProps} />
          )}
        </div>
      </div>
    </>
  );
}
