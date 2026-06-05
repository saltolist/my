"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { useUi } from "@/state/ui-store";
import { normalizeNoteBody } from "@/lib/noteEmbeds";
import {
  buildNoteSnapshot,
  draftNoteTitle,
  noteIdentityKey,
  patchNoteSnapshotAi,
} from "@/lib/noteDraft";
import { usePreventIosInputZoom } from "@/lib/hooks/usePreventIosInputZoom";
import { useFitTitleSize } from "@/lib/use-fit-title";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import type { ActiveNote, NoteFile } from "@/lib/types";

export function useNoteEditor(note: ActiveNote) {
  const { state, dispatch, registerNotePersist } = useApp();
  const { setDirty } = useUi();
  const isMobile = useMobile760();
  const noteKey = noteIdentityKey(note);
  const isView = state.noteMode === "view" && !note.isNew;

  const noteFiles = useMemo(() => (Array.isArray(note.files) ? note.files : []), [note.files]);
  const initialBody = normalizeNoteBody(note.body, noteFiles);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(initialBody);
  const [files, setFiles] = useState<NoteFile[]>([...noteFiles]);
  const [bodyFocusRequest, setBodyFocusRequest] = useState(0);
  const [baselineSnapshot, setBaselineSnapshot] = useState(() =>
    buildNoteSnapshot(note.title, initialBody, note.ai, noteFiles),
  );

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const nextFiles = Array.isArray(note.files) ? [...note.files] : [];
    const nextBody = normalizeNoteBody(note.body, nextFiles);
    setTitle(note.title);
    setBody(nextBody);
    setFiles(nextFiles);
    setBaselineSnapshot(buildNoteSnapshot(note.title, nextBody, note.ai, nextFiles));
  }, [noteKey]); // eslint-disable-line react-hooks/exhaustive-deps -- сброс черновика только при смене заметки

  useEffect(() => {
    setBaselineSnapshot((prev) => patchNoteSnapshotAi(prev, note.ai));
  }, [note.ai]);

  const changed = useMemo(
    () => buildNoteSnapshot(title, body, note.ai, files) !== baselineSnapshot,
    [title, body, note.ai, files, baselineSnapshot],
  );

  useEffect(() => {
    setDirty("note", changed);
  }, [changed, setDirty]);

  useFitTitleSize(titleRef, title, true);
  usePreventIosInputZoom(titleRef, isMobile);

  const setViewMode = useCallback(() => {
    dispatch({ type: "SET_STATE", patch: { noteMode: "view" } });
  }, [dispatch]);

  const setEditMode = useCallback(() => {
    dispatch({ type: "SET_STATE", patch: { noteMode: "edit" } });
  }, [dispatch]);

  const cancel = useCallback(() => {
    const nextBody = normalizeNoteBody(note.body, noteFiles);
    const nextFiles = [...noteFiles];
    setTitle(note.title);
    setBody(nextBody);
    setFiles(nextFiles);
    setBaselineSnapshot(buildNoteSnapshot(note.title, nextBody, note.ai, nextFiles));
    setDirty("note", false);
  }, [note, noteFiles, setDirty]);

  const save = useCallback(() => {
    const finalTitle = draftNoteTitle(title);
    const snapshot = buildNoteSnapshot(finalTitle, body, note.ai, files);
    if (snapshot === baselineSnapshot) return;

    if (note.isNew) {
      if (note.isGlobal) {
        const saved = {
          id: "gn" + Date.now(),
          title: finalTitle,
          body,
          ai: note.ai,
          date: "сейчас",
        };
        dispatch({ type: "UPSERT_GLOBAL_NOTE", note: saved });
        dispatch({
          type: "SET_STATE",
          patch: {
            currentNote: { ...saved, isGlobal: true, files },
            noteMode: "view",
            noteSavedSnapshot: buildNoteSnapshot(finalTitle, body, note.ai, files),
          },
        });
      } else {
        const saved = {
          id: Date.now(),
          title: finalTitle,
          body,
          ai: note.ai,
          date: "сейчас",
          files,
        };
        dispatch({ type: "ADD_POST_NOTE", postId: note.postId, note: saved });
        dispatch({
          type: "SET_STATE",
          patch: {
            currentNote: { ...saved, isGlobal: false, postId: note.postId, files },
            noteMode: "view",
            noteSavedSnapshot: buildNoteSnapshot(finalTitle, body, note.ai, files),
          },
        });
      }
      setBaselineSnapshot(snapshot);
      setDirty("note", false);
      return;
    }

    if (note.isGlobal) {
      const next = { ...note, title: finalTitle, body, files };
      dispatch({ type: "UPSERT_GLOBAL_NOTE", note: next });
      dispatch({
        type: "SET_STATE",
        patch: {
          currentNote: next,
          noteMode: "view",
          noteSavedSnapshot: buildNoteSnapshot(finalTitle, body, note.ai, files),
        },
      });
    } else {
      dispatch({
        type: "UPDATE_POST_NOTE",
        postId: note.postId,
        noteId: note.id,
        patch: { title: finalTitle, body, files },
      });
      dispatch({
        type: "SET_STATE",
        patch: {
          currentNote: { ...note, title: finalTitle, body, files },
          noteMode: "view",
          noteSavedSnapshot: buildNoteSnapshot(finalTitle, body, note.ai, files),
        },
      });
    }
    setBaselineSnapshot(snapshot);
    setDirty("note", false);
  }, [baselineSnapshot, body, dispatch, files, note, setDirty, title]);

  useEffect(() => {
    registerNotePersist(save);
    return () => registerNotePersist(null);
  }, [registerNotePersist, save]);

  const addFile = useCallback((file: File) => {
    const entry: NoteFile = {
      name: file.name,
      type: file.type || "file",
      url: URL.createObjectURL(file),
    };
    setFiles((arr) => [...arr, entry]);
    return entry;
  }, []);

  const onFilePicked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      addFile(file);
      e.target.value = "";
    },
    [addFile],
  );

  const focusBodyFromTitle = useCallback(() => {
    if (isView) setEditMode();
    setBodyFocusRequest((request) => request + 1);
  }, [isView, setEditMode]);

  return {
    note,
    title,
    setTitle,
    body,
    setBody,
    files,
    isView,
    changed,
    bodyFocusRequest,
    titleRef,
    fileInputRef,
    setEditMode,
    setViewMode,
    save,
    cancel,
    addFile,
    onFilePicked,
    focusBodyFromTitle,
  };
}

export type NoteEditorState = ReturnType<typeof useNoteEditor>;
