"use client";

import { useCallback, useMemo } from "react";
import { postById, domainActions, useDomainDispatch, useDomainSelector, useNavigation, useUi } from "@/app/model/store";
import {
  MenuIconBrain,
  MenuIconBrainOff,
  MenuIconCancel,
  MenuIconTrash,
  type PageHeaderOverflowItem,
} from "@/widgets/page-header";
import { routes } from "@/shared/lib/routes";
import type { NavigationPatch } from "@/app/model/store/navigation/types";
import type { ScreenId } from "@/shared/types";

export function useNoteScreen() {
  const dispatch = useDomainDispatch();
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
  const parentPost = useDomainSelector((s) =>
    note && !note.isGlobal ? postById(s, note.postId) : null,
  );

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
        dispatch(domainActions.upsertGlobalNote({ ...note, ai }));
        patchNote({ currentNote: { ...note, ai } });
      } else {
        if (note.ai !== ai) {
          dispatch(domainActions.togglePostNoteAi(note.postId, note.id));
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
      dispatch(domainActions.deleteGlobalNote(note.id));
      goToHref(routes.notes(), { replace: true });
    } else {
      dispatch(domainActions.deletePostNote(note.postId, note.id));
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
