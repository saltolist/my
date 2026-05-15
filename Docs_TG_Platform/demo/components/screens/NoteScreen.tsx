"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp, postById } from "@/state/AppContext";
import { truncate, postTitle } from "@/lib/helpers";
import {
  buildNoteSnapshot,
  draftNoteTitle,
  noteIdentityKey,
} from "@/lib/noteDraft";
import { ContextMenu } from "../ContextMenu";
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

  const toggleNoteAi = () => {
    const next = !note.ai;
    if (note.isNew) {
      dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai: next } } });
      return;
    }
    if (note.isGlobal) {
      dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...note, ai: next } });
      dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai: next } } });
    } else {
      dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: note.postId, noteId: note.id });
      dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai: next } } });
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
                label: note.ai ? "● Учитывать в ИИ" : "○ Учитывать в ИИ",
                icon: "✦",
                active: note.ai,
                onClick: toggleNoteAi,
              },
              {
                label: note.isNew ? "Отменить" : "Удалить заметку",
                icon: note.isNew ? "✕" : "🗑",
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

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [files, setFiles] = useState<NoteFile[]>(Array.isArray(note.files) ? [...note.files] : []);
  const initialSnapRef = useRef(
    state.noteSavedSnapshot ||
      buildNoteSnapshot(note.title, note.body, note.ai, Array.isArray(note.files) ? note.files : []),
  );

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setFiles(Array.isArray(note.files) ? [...note.files] : []);
    initialSnapRef.current =
      state.noteSavedSnapshot ||
      buildNoteSnapshot(note.title, note.body, note.ai, Array.isArray(note.files) ? note.files : []);
  }, [noteKey]); // eslint-disable-line react-hooks/exhaustive-deps -- сброс черновика только при смене заметки

  const changed = useMemo(
    () => buildNoteSnapshot(title, body, note.ai, files) !== initialSnapRef.current,
    [title, body, note.ai, files],
  );

  useEffect(() => {
    setDirty("note", changed);
  }, [changed, setDirty]);

  useFitTitleSize(titleRef, title, true);

  useEffect(() => {
    if (!isView && bodyRef.current) autoGrow(bodyRef.current, 500);
  }, [body, isView]);

  const setViewMode = () => dispatch({ type: "SET_STATE", patch: { noteMode: "view" } });
  const setEditMode = () => dispatch({ type: "SET_STATE", patch: { noteMode: "edit" } });

  const save = useCallback(() => {
    if (!changed) return;
    const finalTitle = draftNoteTitle(title);

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
      initialSnapRef.current = buildNoteSnapshot(finalTitle, body, note.ai, files);
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
    initialSnapRef.current = buildNoteSnapshot(finalTitle, body, note.ai, files);
    setDirty("note", false);
  }, [body, changed, dispatch, files, note, setDirty, title]);

  useEffect(() => {
    registerNotePersist(save);
    return () => registerNotePersist(null);
  }, [registerNotePersist, save]);

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((arr) => [...arr, { name: file.name, type: file.type || "file", url: URL.createObjectURL(file) }]);
    setBody((b) => (b.trimEnd() + `\n[Файл: ${file.name}]`).trimStart());
    e.target.value = "";
  };

  const openPost = () => navigate("post");

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
            saveDisabled={!changed}
          />
        </div>
        <div className="note-shell-content">
          {!note.isGlobal ? (
            <div className="note-local-info">
              📌 Локальная &nbsp;•&nbsp;{" "}
              <a onClick={openPost}>→ пост</a>
            </div>
          ) : null}
          {isView ? (
            <div className="note-body-view">
              {body || <span style={{ color: "var(--text3)" }}>Заметка пустая</span>}
            </div>
          ) : (
            <textarea
              ref={bodyRef}
              className="note-body-edit"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          )}
          <NoteFilesView files={files} />
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

function NoteFilesView({ files }: { files: NoteFile[] | undefined }) {
  if (!files || files.length === 0) return null;
  return (
    <div className="note-files">
      <div className="note-files-label">Вложения</div>
      {files.map((f, i) =>
        f.url ? (
          <a key={i} className="note-file-item" href={f.url} target="_blank" rel="noopener noreferrer">
            📎 <b>{f.name}</b> <span>({f.type || "file"})</span>
          </a>
        ) : (
          <div key={i} className="note-file-item">
            📎 <b>{f.name}</b> <span>({f.type || "file"})</span>
          </div>
        ),
      )}
    </div>
  );
}

function autoGrow(el: HTMLTextAreaElement, min: number) {
  el.style.height = "auto";
  el.style.height = Math.max(el.scrollHeight, min) + "px";
}
