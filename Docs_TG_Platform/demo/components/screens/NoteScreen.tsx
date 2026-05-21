"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp, postById } from "@/state/AppContext";
import { truncate, postTitle } from "@/lib/helpers";
import { normalizeNoteBody } from "@/lib/noteEmbeds";
import {
  buildNoteSnapshot,
  draftNoteTitle,
  noteIdentityKey,
  patchNoteSnapshotAi,
} from "@/lib/noteDraft";
import { ContextMenu } from "../ContextMenu";
import NoteBodyEditor from "../note/NoteBodyEditor";
import NoteFilesPanel from "../note/NoteFilesPanel";
import NoteHeaderToolbar from "../note/NoteHeaderToolbar";
import PageHeader from "../PageHeader";
import type { ActiveNote, NoteFile } from "@/lib/types";
import { useFitTitleSize } from "@/lib/use-fit-title";

export default function NoteScreen() {
  const { state, dispatch, navigate, navigateBack, openPost, setDirty } = useApp();
  const note = state.currentNote;

  if (!note) {
    return <PageHeader title="Заметка" backTo="notes" />;
  }

  const backFallback = state.noteFrom === "post" ? "post" : "notes";
  const parentPost = !note.isGlobal ? postById(state, note.postId) : null;

  const discardNewNote = () => {
    setDirty("note", false);
    const dest = state.noteFrom === "post" ? "post" : "notes";
    dispatch({ type: "SET_STATE", patch: { screen: dest, currentNote: null, noteMode: "view" } });
  };

  const setNoteAi = (ai: boolean) => {
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
  };

  return (
    <>
      <PageHeader
        backTo={backFallback}
        left={
          <NoteBreadcrumb
            note={note}
            parentPost={parentPost}
            onNavigateNotes={() => navigateBack("notes")}
            onNavigateFeed={() => navigate("feed")}
            onOpenPost={openPost}
          />
        }
        actions={
          <ContextMenu
            items={[
              {
                label: note.ai ? "Не учитывать в ИИ" : "Учитывать в ИИ",
                onClick: () => setNoteAi(!note.ai),
              },
              {
                label: note.isNew ? "Отменить" : "Удалить заметку",
                danger: !note.isNew,
                onClick: () => {
                  if (note.isNew) {
                    discardNewNote();
                    return;
                  }
                  if (!confirm(`Удалить заметку «${note.title}»?`)) return;
                  if (note.isGlobal) {
                    dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: note.id });
                    navigate("notes", { skipHistory: true });
                  } else {
                    dispatch({ type: "DELETE_POST_NOTE", postId: note.postId, noteId: note.id });
                    navigate("post", { skipHistory: true });
                  }
                },
              },
            ]}
          />
        }
      />
      <div className="note-page" id="note-page-body">
        <NoteWorkspace note={note} />
      </div>
    </>
  );
}

function NoteBreadcrumb({
  note,
  parentPost,
  onNavigateNotes,
  onNavigateFeed,
  onOpenPost,
  titleLabel,
}: {
  note: ActiveNote;
  parentPost: ReturnType<typeof postById>;
  onNavigateNotes: () => void;
  onNavigateFeed: () => void;
  onOpenPost: (id: number) => void;
  titleLabel?: string;
}) {
  const title = titleLabel ?? (note.title || "Новая заметка");
  if (note.isGlobal) {
    return (
      <div className="breadcrumb">
        <span className="bc-link" onClick={onNavigateNotes}>
          Заметки
        </span>
        <span className="bc-sep">/</span>
        <span className="crumb-current">{truncate(title, 38)}</span>
      </div>
    );
  }
  return (
    <div className="breadcrumb">
      <span className="bc-link" onClick={onNavigateFeed}>
        Лента
      </span>
      <span className="bc-sep">/</span>
      {parentPost ? (
        <>
          <span className="bc-link" onClick={() => onOpenPost(note.postId)}>
            {truncate(postTitle(parentPost), 32)}
          </span>
          <span className="bc-sep">/</span>
        </>
      ) : null}
      <span className="crumb-current">{truncate(title, 38)}</span>
    </div>
  );
}

function NoteWorkspace({ note }: { note: ActiveNote }) {
  const { state, dispatch, navigate, setDirty, registerNotePersist } = useApp();
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

  /* «Учитывать в ИИ» в шапке сохраняется сразу — синхронизируем baseline, не помечая текст грязным */
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

  const setViewMode = () => dispatch({ type: "SET_STATE", patch: { noteMode: "view" } });
  const setEditMode = () => dispatch({ type: "SET_STATE", patch: { noteMode: "edit" } });

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

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addFile(file);
    e.target.value = "";
  };

  const openPost = () => navigate("post");
  const focusBodyFromTitle = () => {
    if (isView) setEditMode();
    setBodyFocusRequest((request) => request + 1);
  };

  return (
    <div className="note-layout">
      <div className="note-shell">
        <div className="note-shell-header">
          <div className="note-title-block">
            <div className="note-title-row">
              <textarea
                ref={titleRef}
                className="note-title-edit"
                rows={1}
                placeholder="Без названия"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  focusBodyFromTitle();
                }}
              />
            </div>
          </div>
          <NoteHeaderToolbar
            mode={isView ? "view" : "edit"}
            showAttach={!isView}
            onAttach={() => fileInputRef.current?.click()}
            showModeToggle={!note.isNew}
            onToggleMode={isView ? setEditMode : setViewMode}
            onSave={save}
            onCancel={cancel}
            saveDisabled={!changed}
            showCancel={changed}
          />
        </div>
        <div className="note-shell-content">
          {!note.isGlobal ? (
            <div className="note-local-info">
              📌 Локальная &nbsp;•&nbsp;{" "}
              <a onClick={openPost}>→ пост</a>
            </div>
          ) : null}
          <NoteBodyEditor
            body={body}
            files={files}
            isView={isView}
            onBodyChange={setBody}
            onAddFile={addFile}
            onEditRequest={setEditMode}
            focusRequest={bodyFocusRequest}
          />
          <NoteFilesPanel files={files} draggable />
        </div>
      </div>
      <div className="note-timestamps">
        Создана: {note.date} &nbsp;•&nbsp; Изменена: {changed ? "сейчас" : note.date}
      </div>
      {!isView ? (
        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={onFilePicked} />
      ) : null}
    </div>
  );
}

