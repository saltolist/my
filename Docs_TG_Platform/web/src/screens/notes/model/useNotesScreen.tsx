"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useNavigationStore } from "@/app/model/store";
import { useGlobalNotes, useUpsertGlobalNote } from "@/entities/note";
import { usePosts, useTogglePostNoteAi } from "@/entities/post";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import {
  buildAnyNoteItems,
  filterAnyNotes,
  filterNotesByScope,
  notesEmptyLabel,
  type AnyNote,
} from "@/shared/lib/notes/noteList";
import { routes } from "@/shared/lib/routes";

export function useNotesScreen() {
  const router = useRouter();
  const isMobile = useMobile760();
  const scope = useNavigationStore((s) => s.noteScope);
  const filter = useNavigationStore((s) => s.noteFilter);
  const search = useNavigationStore((s) => s.notesSearch);

  const { data: globalNotes = [], isLoading: globalLoading } = useGlobalNotes();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const upsertGlobalNote = useUpsertGlobalNote();
  const togglePostNoteAi = useTogglePostNoteAi();

  const items = useMemo(
    () => filterNotesByScope(buildAnyNoteItems(globalNotes, posts), scope),
    [scope, globalNotes, posts],
  );

  const filtered = useMemo(
    () => filterAnyNotes(items, { filter, searchQuery: search }),
    [filter, items, search],
  );

  const openNote = useCallback(
    (n: AnyNote) => {
      if (n.isGlobal) {
        router.push(routes.noteGlobal(n.id));
      } else {
        router.push(routes.notePost(n.postId, n.id));
      }
    },
    [router],
  );

  const toggleAi = useCallback(
    (n: AnyNote) => {
      if (n.isGlobal) {
        void upsertGlobalNote.mutateAsync({ ...n, ai: !n.ai });
      } else {
        void togglePostNoteAi(n.postId, n.id);
      }
    },
    [togglePostNoteAi, upsertGlobalNote],
  );

  const newGlobal = useCallback(() => {
    router.push(routes.noteNew("notes"));
  }, [router]);

  return {
    data: {
      scope,
      filter,
      filtered,
      emptyLabel: notesEmptyLabel(scope),
      isLoading: globalLoading || postsLoading,
    },
    ui: {
      isMobile,
    },
    actions: {
      openNote,
      toggleAi,
      newGlobal,
    },
  };
}

export type NotesScreenState = ReturnType<typeof useNotesScreen>;
