"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp, postById } from "@/state/AppContext";
import { truncate, postTitle } from "@/lib/helpers";
import { ContextMenu } from "../ContextMenu";
import NoteHeaderToolbar from "../note/NoteHeaderToolbar";
import PageHeader from "../PageHeader";
import { draftNoteTitle } from "@/lib/noteDraft";
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

  const breadcrumb =
    note.isGlobal ? (
      <div className="breadcrumb">
        <span className="bc-link" onClick={() => navigateBack("notes")}>
          Заметки
        </span>
        <span className="bc-sep">/</span>
        <span className="crumb-current">{truncate(note.title || "Новая заметка", 38)}</span>
      </div>
    ) : (
      <div className="breadcrumb">
        <span className="bc-link" onClick={() => navigate("feed")}>
          Лента
        </span>
        <span className="bc-sep">/</span>
        {parentPost ? (
          <>
            <span className="bc-link" onClick={() => openPost(note.postId)}>
              {truncate(postTitle(parentPost), 32)}
            </span>
            <span className="bc-sep">/</span>
          </>
        ) : null}
        <span className="crumb-current">{truncate(note.title || "Новая заметка", 38)}</span>
      </div>
    );

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
        left={breadcrumb}
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
        {state.noteMode === "view" && !note.isNew ? (
          <NoteView note={note} onOpenPost={openPost} />
        ) : (
          <NoteEdit note={note} />
        )}
      </div>
    </>
  );
}

function NoteView({ note, onOpenPost }: { note: ActiveNote; onOpenPost: (id: number) => void }) {
  const { dispatch } = useApp();
  const titleRef = useRef<HTMLDivElement>(null);
  useFitTitleSize(titleRef, note.title, false);
  const setEdit = () => dispatch({ type: "SET_STATE", patch: { noteMode: "edit" } });
  return (
    <div className="note-layout">
      <div className="note-shell">
        <div className="note-shell-header">
          <div className="note-title-block">
            <div className="note-title-row">
              <div className="note-title-static" id="note-title-static-el" ref={titleRef}>
                {note.title}
              </div>
            </div>
          </div>
          <NoteHeaderToolbar mode="view" onToggleMode={setEdit} saveDisabled />
        </div>
        <div className="note-shell-content">
          {!note.isGlobal ? (
            <div className="note-local-info">
              📌 Локальная &nbsp;•&nbsp;{" "}
              <a onClick={() => onOpenPost(note.postId)}>→ пост</a>
            </div>
          ) : null}
          <div className="note-body-view">
            {note.body || <span style={{ color: "var(--text3)" }}>Заметка пустая</span>}
          </div>
          <NoteFilesView files={note.files} />
        </div>
      </div>
      <div className="note-timestamps">
        Создана: {note.date} &nbsp;•&nbsp; Изменена: {note.date}
      </div>
    </div>
  );
}

function NoteEdit({ note }: { note: ActiveNote }) {
  const { dispatch, navigate, setDirty, registerNotePersist } = useApp();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [files, setFiles] = useState<NoteFile[]>(Array.isArray(note.files) ? note.files : []);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) autoGrow(bodyRef.current, 500);
  }, [body]);

  useFitTitleSize(titleRef, title, true);

  const initialSnap = JSON.stringify({ title: note.title, body: note.body, ai: note.ai, files: note.files || [] });
  const currentSnap = JSON.stringify({ title: title.trim(), body, ai: note.ai, files });
  const changed = currentSnap !== initialSnap;

  useEffect(() => {
    setDirty("note", changed);
  }, [changed, setDirty]);

  useEffect(() => {
    return () => setDirty("note", false);
  }, [setDirty]);

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
          },
        });
      }
      setDirty("note", false);
      return;
    }

    if (note.isGlobal) {
      const next = { ...note, title: finalTitle, body, files };
      dispatch({ type: "UPSERT_GLOBAL_NOTE", note: next });
      dispatch({ type: "SET_STATE", patch: { currentNote: next, noteMode: "view" } });
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
        },
      });
    }
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
            mode="edit"
            showAttach
            onAttach={() => fileInputRef.current?.click()}
            showModeToggle={!note.isNew}
            onToggleMode={() => dispatch({ type: "SET_STATE", patch: { noteMode: "view" } })}
            onSave={save}
            saveDisabled={!changed}
          />
        </div>
        <div className="note-shell-content">
          {!note.isGlobal ? (
            <div className="note-local-info">
              📌 Локальная &nbsp;•&nbsp;{" "}
              <a
                onClick={() => {
                  navigate("post");
                }}
              >
                → пост
              </a>
            </div>
          ) : null}
          <textarea
            ref={bodyRef}
            className="note-body-edit"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <NoteFilesView files={files} />
        </div>
      </div>
      <div className="note-timestamps">
        Создана: {note.date} &nbsp;•&nbsp; Изменена: сейчас
      </div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={onFilePicked} />
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
