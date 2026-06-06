"use client";

import { useCallback, useMemo, useState } from "react";
import {
  domainActions,
  selectGlobalNotes,
  selectPosts,
  useDomainDispatch,
  useDomainSelector,
  useNavigation,
} from "@/app/model/store";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import {
  buildAnyNoteItems,
  filterAnyNotes,
  filterNotesByScope,
  notesEmptyLabel,
  type AnyNote,
} from "@/shared/lib/notes/noteList";
import { routes } from "@/shared/lib/routes";
import type { NoteListFilter, NoteScope } from "@/shared/types";

export type { AnyNote };

export function useNotesScreen() {
  const globalNotes = useDomainSelector(selectGlobalNotes);
  const posts = useDomainSelector(selectPosts);
  const dispatch = useDomainDispatch();
  const { noteScope: scope, noteFilter: filter, goToHref, navDispatch } = useNavigation();
  const isMobile = useMobile760();
  const [search, setSearch] = useState("");

  const setScope = useCallback(
    (v: NoteScope) => navDispatch({ type: "SET_NAV", patch: { noteScope: v } }),
    [navDispatch],
  );

  const setFilter = useCallback(
    (v: NoteListFilter) => navDispatch({ type: "SET_NAV", patch: { noteFilter: v } }),
    [navDispatch],
  );

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
        goToHref(routes.noteGlobal(n.id as string));
      } else {
        goToHref(routes.notePost(n.postId, n.id as number));
      }
    },
    [goToHref],
  );

  const toggleAi = useCallback(
    (n: AnyNote) => {
      if (n.isGlobal) {
        dispatch(domainActions.upsertGlobalNote({ ...n, ai: !n.ai }));
      } else {
        dispatch(domainActions.togglePostNoteAi(n.postId, n.id));
      }
    },
    [dispatch],
  );

  const newGlobal = useCallback(() => {
    goToHref(routes.noteNew("notes"));
  }, [goToHref]);

  const notesScopeSelectProps = useMemo(
    () => ({
      ariaLabel: "Область заметок",
      value: scope,
      options: [
        { value: "all", label: "Все" },
        { value: "global", label: "Глобальные" },
        { value: "local", label: "Локальные" },
      ],
      onChange: (v: string) => setScope(v as NoteScope),
    }),
    [scope, setScope],
  );

  const notesContextFilterSelectProps = useMemo(
    () => ({
      ariaLabel: "Контекст заметок",
      value: filter,
      options: [
        { value: "all", label: "Все" },
        { value: "ai", label: "В контексте" },
        { value: "noai", label: "Не в контексте" },
      ],
      onChange: (v: string) => setFilter(v as NoteListFilter),
    }),
    [filter, setFilter],
  );

  const emptyLabel = notesEmptyLabel(scope);

  return {
    data: {
      scope,
      filter,
      filtered,
      emptyLabel,
    },
    ui: {
      isMobile,
      search,
      setSearch,
      notesScopeSelectProps,
      notesContextFilterSelectProps,
    },
    actions: {
      setScope,
      setFilter,
      openNote,
      toggleAi,
      newGlobal,
    },
  };
}

export type NotesScreenState = ReturnType<typeof useNotesScreen>;
