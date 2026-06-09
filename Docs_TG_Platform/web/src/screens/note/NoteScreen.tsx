"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { StickyNote } from "lucide-react";
import { useGlobalNotes } from "@/entities/note";
import { usePost } from "@/entities/post";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { NOTE_NEW_SLUG } from "@/shared/lib/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

export function NoteScreen() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onBack = useScreenBack();

  const isNew = pathname?.includes(`/note/${NOTE_NEW_SLUG}/`) ?? false;
  const globalId = typeof params.id === "string" && !isNew ? params.id : null;
  const postId = params.postId ? Number(params.postId) : null;
  const noteId = params.noteId ? Number(params.noteId) : null;

  const { data: notes, isLoading: notesLoading } = useGlobalNotes();
  const { data: post, isLoading: postLoading } = usePost(postId ?? 0);

  const globalNote = globalId ? notes?.find((n) => n.id === globalId) : null;
  const localNote = postId && noteId ? post?.notes.find((n) => n.id === noteId) : null;

  let title = "Заметка";
  if (isNew) title = "Новая заметка";
  else if (globalNote) title = globalNote.title;
  else if (localNote) title = localNote.title;

  const loading = isNew ? false : globalId ? notesLoading : postLoading;

  return (
    <ScreenShell header={<PageHeader title={title} onBack={onBack} />}>
      <EmptyState
        icon={<StickyNote className="size-5" />}
        message={
          loading
            ? "Загрузка заметки…"
            : isNew
              ? `from=${searchParams.get("from") ?? "notes"}`
              : "Note editor — M3+ (note-editor widget)."
        }
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
