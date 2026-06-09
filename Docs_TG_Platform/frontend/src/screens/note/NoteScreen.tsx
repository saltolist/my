"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useGlobalNotes, useUpsertGlobalNote } from "@/entities/note/model/useGlobalNotes";
import { usePosts, useUpdatePost } from "@/entities/post/model/usePosts";
import { useDeleteNote } from "@/features/delete-note";
import {
  buildNoteSnapshot,
  createNewGlobalNote,
  createNewPostNote,
  draftNoteTitle,
  EMPTY_NOTE_SNAPSHOT,
} from "@/shared/lib/noteDraft";
import { parseAppPath, routes } from "@/shared/lib/routes";
import type { ActiveNote, GlobalNote, NoteFile, Post } from "@/shared/types";
import { Skeleton } from "@/shared/ui/skeleton";
import { NoteEditor } from "@/widgets/note-editor";
import { PageHeader } from "@/widgets/page-header";

function resolveNoteFromData(
  parsed: ReturnType<typeof parseAppPath>,
  globalNotes: GlobalNote[],
  posts: Post[],
  noteFrom: "notes" | "post",
): ActiveNote | null {
  if (parsed.noteIsNew) {
    if (noteFrom === "post" && parsed.notePostId != null) {
      return createNewPostNote(parsed.notePostId);
    }
    return createNewGlobalNote();
  }
  if (parsed.noteGlobalId) {
    const n = globalNotes.find((x) => x.id === parsed.noteGlobalId);
    if (!n) return null;
    return { ...n, isGlobal: true, files: n.files ?? [] };
  }
  if (parsed.notePostId != null && parsed.noteId != null) {
    const post = posts.find((p) => p.id === parsed.notePostId);
    const n = post?.notes.find((x) => x.id === parsed.noteId);
    if (!n) return null;
    return { ...n, isGlobal: false, postId: parsed.notePostId, files: n.files ?? [] };
  }
  return null;
}

export function NoteScreen() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const parsed = parseAppPath(pathname);
  const noteFrom =
    searchParams.get("from") === "post" || parsed.notePostId != null ? "post" : "notes";

  const { data: notesList = [], isLoading: globalLoading } = useGlobalNotes();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const upsertGlobal = useUpsertGlobalNote();
  const updatePost = useUpdatePost();
  const deleteNote = useDeleteNote();

  const sourceNote = useMemo(
    () => resolveNoteFromData(parsed, notesList, posts, noteFrom),
    [noteFrom, notesList, parsed, posts],
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ai, setAi] = useState(false);
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [baseline, setBaseline] = useState(EMPTY_NOTE_SNAPSHOT);

  useEffect(() => {
    if (!sourceNote) return;
    setTitle(sourceNote.title);
    setBody(sourceNote.body);
    setAi(sourceNote.ai);
    setFiles(sourceNote.files ?? []);
    setBaseline(
      buildNoteSnapshot(
        sourceNote.title,
        sourceNote.body,
        sourceNote.ai,
        sourceNote.files ?? [],
      ),
    );
  }, [sourceNote]);

  const breadcrumbs = useMemo(() => {
    if (!sourceNote) {
      return [{ label: "Заметки", href: routes.notes() }, { label: "Заметка" }];
    }
    if (sourceNote.isGlobal) {
      return [
        { label: "Заметки", href: routes.notes() },
        { label: sourceNote.title || "Без названия" },
      ];
    }
    const post = posts.find((p) => p.id === sourceNote.postId);
    return [
      { label: "Лента", href: routes.feed() },
      {
        label: post ? `Пост #${post.id}` : "Пост",
        href: routes.post(sourceNote.postId),
      },
      { label: sourceNote.title || "Без названия" },
    ];
  }, [posts, sourceNote]);

  const handleSave = useCallback(async () => {
    if (!sourceNote) return;
    const finalTitle = draftNoteTitle(title);
    const snapshot = buildNoteSnapshot(finalTitle, body, ai, files);

    if (sourceNote.isGlobal) {
      const id = sourceNote.isNew ? `gn${Date.now()}` : String(sourceNote.id);
      await upsertGlobal.mutateAsync({
        id,
        title: finalTitle,
        body,
        ai,
        date: sourceNote.isNew ? "сейчас" : sourceNote.date,
        files,
      });
      setBaseline(snapshot);
      if (sourceNote.isNew) {
        router.replace(routes.noteGlobal(id));
      }
      return;
    }

    const post = posts.find((p) => p.id === sourceNote.postId);
    if (!post) return;
    const nextNotes = sourceNote.isNew
      ? [
          ...post.notes,
          {
            id: Date.now(),
            title: finalTitle,
            body,
            ai,
            date: "сейчас",
            files,
          },
        ]
      : post.notes.map((n) =>
          n.id === sourceNote.id ? { ...n, title: finalTitle, body, ai, files } : n,
        );
    await updatePost.mutateAsync({ id: sourceNote.postId, patch: { notes: nextNotes } });
    setBaseline(snapshot);
    if (sourceNote.isNew) {
      const created = nextNotes[nextNotes.length - 1];
      if (created) {
        router.replace(routes.notePost(sourceNote.postId, created.id));
      }
    }
  }, [ai, body, files, posts, router, sourceNote, title, updatePost, upsertGlobal]);

  const handleCancel = useCallback(() => {
    if (!sourceNote) return;
    setTitle(sourceNote.title);
    setBody(sourceNote.body);
    setAi(sourceNote.ai);
    setFiles(sourceNote.files ?? []);
  }, [sourceNote]);

  const handleDelete = useCallback(async () => {
    if (!sourceNote || sourceNote.isNew) return;
    if (!confirm("Удалить заметку?")) return;
    await deleteNote.mutateAsync(sourceNote);
    router.push(sourceNote.isGlobal ? routes.notes() : routes.post(sourceNote.postId));
  }, [deleteNote, router, sourceNote]);

  const isLoading = globalLoading || postsLoading;

  if (isLoading && !sourceNote) {
    return (
      <>
        <PageHeader breadcrumbs={breadcrumbs} />
        <Skeleton className="mx-auto mt-8 h-64 w-full max-w-3xl" />
      </>
    );
  }

  if (!sourceNote) {
    return (
      <>
        <PageHeader breadcrumbs={breadcrumbs} />
        <p className="p-8 text-sm text-muted-foreground">Заметка не найдена</p>
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <NoteEditor
        title={title}
        body={body}
        ai={ai}
        files={files}
        isNew={sourceNote.isNew}
        date={sourceNote.date}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onAiChange={setAi}
        onFilesChange={setFiles}
        onSave={() => void handleSave()}
        onCancel={handleCancel}
        onDelete={sourceNote.isNew ? undefined : () => void handleDelete()}
        baselineSnapshot={baseline}
      />
    </>
  );
}
