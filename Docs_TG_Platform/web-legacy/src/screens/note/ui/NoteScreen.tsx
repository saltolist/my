"use client";

import { PageHeader } from "@/widgets/page-header";
import NoteBreadcrumb from "@/screens/note/ui/NoteBreadcrumb";
import NoteEditor from "@/screens/note/ui/NoteEditor";
import { useNoteScreen } from "@/screens/note/model/useNoteScreen";

export default function NoteScreen() {
  const { data, ui, actions } = useNoteScreen();

  if (!data.note) {
    return <PageHeader title="Заметка" backTo="notes" />;
  }

  return (
    <>
      <PageHeader
        backTo={data.backFallback}
        overflowItems={ui.noteHeaderMenuItems}
        left={
          <NoteBreadcrumb
            note={data.note}
            parentPost={data.parentPost}
            onNavigateNotes={() => actions.navigateBack("notes")}
            onNavigateFeed={() => actions.navigate("feed")}
            onOpenPost={(id) => actions.openPost(id)}
          />
        }
      />
      <div className="note-page" id="note-page-body">
        <NoteEditor note={data.note} />
      </div>
    </>
  );
}
