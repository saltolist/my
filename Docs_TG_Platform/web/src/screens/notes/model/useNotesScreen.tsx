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
import { postTitle } from "@/shared/lib/helpers";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { routes } from "@/shared/lib/routes";
import type { GlobalNote, LocalNote, NoteListFilter, NoteScope } from "@/shared/types";

export type AnyNote =
  | (GlobalNote & { isGlobal: true })
  | (LocalNote & { isGlobal: false; postId: number; postTitle: string });

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

  const items = useMemo(() => {
    const globalItems: AnyNote[] = globalNotes.map((n) => ({ ...n, isGlobal: true }));
    const localItems: AnyNote[] = posts.flatMap((p) =>
      p.notes.map((n) => ({
        ...n,
        isGlobal: false as const,
        postId: p.id,
        postTitle: postTitle(p),
      })),
    );
    if (scope === "global") return globalItems;
    if (scope === "local") return localItems;
    return [...globalItems, ...localItems];
  }, [scope, globalNotes, posts]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter((n) => {
        if (filter === "ai" && !n.ai) return false;
        if (filter === "noai" && n.ai) return false;
        if (q && !n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
        return true;
      }),
    [filter, items, q],
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

  const emptyLabel =
    scope === "global"
      ? "Нет глобальных заметок"
      : scope === "local"
        ? "Нет локальных заметок"
        : "Нет заметок";

  return {
    isMobile,
    search,
    setSearch,
    scope,
    filter,
    setScope,
    setFilter,
    filtered,
    openNote,
    toggleAi,
    newGlobal,
    notesScopeSelectProps,
    notesContextFilterSelectProps,
    emptyLabel,
  };
}

export type NotesScreenState = ReturnType<typeof useNotesScreen>;
