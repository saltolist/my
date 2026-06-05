"use client";

import { PageHeader } from "@/widgets/page-header";
import NoteBreadcrumb from "@/screens/note/ui/NoteBreadcrumb";
import NoteEditor from "@/screens/note/ui/NoteEditor";
import { useNoteScreen } from "@/screens/note/model/useNoteScreen";

export default function NoteScreen() {
  const ns = useNoteScreen();

  if (!ns.note) {
    return <PageHeader title="Заметка" backTo="notes" />;
  }

  return (
    <>
      <PageHeader
        backTo={ns.backFallback}
        overflowItems={ns.noteHeaderMenuItems}
        left={
          <NoteBreadcrumb
            note={ns.note}
            parentPost={ns.parentPost}
            onNavigateNotes={() => ns.navigateBack("notes")}
            onNavigateFeed={() => ns.navigate("feed")}
            onOpenPost={(id) => ns.openPost(id)}
          />
        }
      />
      <div className="note-page" id="note-page-body">
        <NoteEditor note={ns.note} />
      </div>
    </>
  );
}
