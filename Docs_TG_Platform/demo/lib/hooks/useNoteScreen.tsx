"use client";

import { useCallback, useMemo } from "react";
import { postById, useApp } from "@/state/AppContext";
import { useUi } from "@/state/ui-store";
import {
  MenuIconBrain,
  MenuIconBrainOff,
  MenuIconCancel,
  MenuIconTrash,
} from "@/components/HeaderMenuIcons";
import { routes } from "@/lib/routes";
import type { ScreenId } from "@/lib/types";
import type { PageHeaderOverflowItem } from "@/components/PageHeaderOverflow";

export function useNoteScreen() {
  const { state, dispatch, navigate, navigateBack, openPost, goToHref } = useApp();
  const { setDirty } = useUi();
  const note = state.currentNote;
  const backFallback: ScreenId = state.noteFrom === "post" ? "post" : "notes";
  const parentPost = note && !note.isGlobal ? postById(state, note.postId) : null;

  const discardNewNote = useCallback(() => {
    setDirty("note", false);
    if (state.noteFrom === "post" && note && !note.isGlobal) {
      goToHref(routes.post(note.postId), { replace: true });
    } else {
      goToHref(routes.notes(), { replace: true });
    }
  }, [goToHref, note, setDirty, state.noteFrom]);

  const setNoteAi = useCallback(
    (ai: boolean) => {
      if (!note) return;
      if (note.ai === ai) return;
      if (note.isNew) {
        dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai } } });
        return;
      }
      if (note.isGlobal) {
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...note, ai } });
        dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai } } });
      } else {
        if (note.ai !== ai) {
          dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: note.postId, noteId: note.id });
        }
        dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai } } });
      }
    },
    [dispatch, note],
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
