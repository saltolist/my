"use client";

import { ContextMenu } from "@/components/ContextMenu";
import PageHeader from "@/components/PageHeader";
import NoteBreadcrumb from "@/components/screens/note/NoteBreadcrumb";
import NoteEditor from "@/components/screens/note/NoteEditor";
import { useNoteScreen } from "@/lib/hooks/useNoteScreen";

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
        actions={<ContextMenu items={ns.noteHeaderMenuItems} />}
      />
      <div className="note-page" id="note-page-body">
        <NoteEditor note={ns.note} />
      </div>
    </>
  );
}
