"use client";

import { useCallback, useMemo } from "react";
import { postById, useDomain } from "@/state/domain-store";
import { useNavigation } from "@/state/navigation-store";
import { useUi } from "@/state/ui-store";
import {
  MenuIconBrain,
  MenuIconBrainOff,
  MenuIconCancel,
  MenuIconTrash,
} from "@/components/HeaderMenuIcons";
import { routes } from "@/lib/routes";
import type { NavigationPatch } from "@/state/navigation/types";
import type { ScreenId } from "@/lib/types";
import type { PageHeaderOverflowItem } from "@/components/PageHeaderOverflow";

export function useNoteScreen() {
  const { state: domain, dispatch } = useDomain();
  const {
    currentNote: note,
    noteFrom,
    navigate,
    navigateBack,
    openPost,
    goToHref,
    navDispatch,
  } = useNavigation();
  const { setDirty } = useUi();
  const backFallback: ScreenId = noteFrom === "post" ? "post" : "notes";
  const parentPost = note && !note.isGlobal ? postById(domain, note.postId) : null;

  const patchNote = useCallback(
    (patch: NavigationPatch) => {
      navDispatch({ type: "SET_NAV", patch });
    },
    [navDispatch],
  );

  const discardNewNote = useCallback(() => {
    setDirty("note", false);
    if (noteFrom === "post" && note && !note.isGlobal) {
      goToHref(routes.post(note.postId), { replace: true });
    } else {
      goToHref(routes.notes(), { replace: true });
    }
  }, [goToHref, note, noteFrom, setDirty]);

  const setNoteAi = useCallback(
    (ai: boolean) => {
      if (!note) return;
      if (note.ai === ai) return;
      if (note.isNew) {
        patchNote({ currentNote: { ...note, ai } });
        return;
      }
      if (note.isGlobal) {
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...note, ai } });
        patchNote({ currentNote: { ...note, ai } });
      } else {
        if (note.ai !== ai) {
          dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: note.postId, noteId: note.id });
        }
        patchNote({ currentNote: { ...note, ai } });
      }
    },
    [dispatch, note, patchNote],
  );

  const deleteNote = useCallback(() => {
    if (!note || note.isNew) return;
    if (!confirm(`Удалить заметку «${note.title}»?`)) return;
    if (note.isGlobal) {
      dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: note.id });
      goToHref(routes.notes(), { replace: true });
    } else {
      dispatch({ type: "DELETE_POST_NOTE", postId: note.postId, noteId: note.id });
      goToHref(routes.post(note.postId), { replace: true });
    }
  }, [dispatch, goToHref, note]);

  const noteHeaderMenuItems = useMemo((): PageHeaderOverflowItem[] => {
    if (!note) return [];
    return [
      {
        label: note.ai ? "Не учитывать в ИИ" : "Учитывать в ИИ",
        icon: note.ai ? <MenuIconBrainOff /> : <MenuIconBrain />,
        onClick: () => setNoteAi(!note.ai),
      },
      {
        label: note.isNew ? "Отменить" : "Удалить заметку",
        icon: note.isNew ? <MenuIconCancel /> : <MenuIconTrash />,
        danger: !note.isNew,
        onClick: () => {
          if (note.isNew) {
            discardNewNote();
            return;
          }
          deleteNote();
        },
      },
    ];
  }, [deleteNote, discardNewNote, note, setNoteAi]);

  return {
    note,
    backFallback,
    parentPost,
    noteHeaderMenuItems,
    navigate,
    navigateBack,
    openPost,
  };
}

export type NoteScreenState = ReturnType<typeof useNoteScreen>;
