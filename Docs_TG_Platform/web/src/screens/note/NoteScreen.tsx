"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useGlobalNotes } from "@/entities/note";
import { usePost } from "@/entities/post";
import { NOTE_NEW_SLUG } from "@/shared/lib/routes";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function NoteScreen() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isNew = pathname?.includes(`/note/${NOTE_NEW_SLUG}/`) ?? false;
  const globalId =
    typeof params.id === "string" && !isNew ? params.id : null;
  const postId = params.postId ? Number(params.postId) : null;
  const noteId = params.noteId ? Number(params.noteId) : null;

  const { data: notes, isLoading: notesLoading, error: notesError } = useGlobalNotes();
  const { data: post, isLoading: postLoading, error: postError } = usePost(postId ?? 0);

  const globalNote = globalId ? notes?.find((n) => n.id === globalId) : null;
  const localNote =
    postId && noteId ? post?.notes.find((n) => n.id === noteId) : null;

  let title = "Заметка";
  if (isNew) title = "Новая заметка";
  else if (globalNote) title = globalNote.title;
  else if (localNote) title = localNote.title;

  const from = searchParams.get("from");

  return (
    <PlaceholderScreen title={title} subtitle="Note editor — M3+ (note-editor widget).">
      {isNew ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          from={from ?? "notes"}
          {searchParams.get("postId") ? `, postId=${searchParams.get("postId")}` : ""}
        </p>
      ) : globalId ? (
        <DataStatus
          loading={notesLoading}
          error={notesError}
          count={globalNote ? 1 : 0}
          label={`глобальной заметки ${globalId}`}
        />
      ) : postId && noteId ? (
        <DataStatus
          loading={postLoading}
          error={postError}
          count={localNote ? 1 : 0}
          label={`локальной заметки ${noteId} в посте ${postId}`}
        />
      ) : null}
    </PlaceholderScreen>
  );
}
