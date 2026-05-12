"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { truncate } from "@/lib/helpers";
import { ContextMenu } from "../ContextMenu";
import type { ActiveNote, NoteFile } from "@/lib/types";
import { useFitTitleSize } from "@/lib/use-fit-title";

export default function NoteScreen() {
  const { state, dispatch, navigate, openPost } = useApp();
  const note = state.currentNote;

  if (!note) {
    return (
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("notes")} type="button">
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  const backLabel = note.isGlobal ? "Заметки" : "Лента / Пост";
  const goBack = () => navigate(state.noteFrom === "post" ? "post" : "notes");

  return (
    <>
      <div className="page-header" id="note-hdr-row">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span className="bc-link" onClick={goBack}>
              {backLabel}
            </span>
            <span>/</span>
            <b>{truncate(note.title, 30)}</b>
          </div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={goBack} type="button">
            ← Назад
          </button>
          <ContextMenu
            items={[
              {
                label: "Удалить заметку",
                icon: "🗑",
                danger: true,
                onClick: () => {
                  if (!confirm(`Удалить заметку «${note.title}»?`)) return;
                  if (note.isGlobal) {
                    dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: note.id });
                    navigate("notes");
                  } else {
                    dispatch({ type: "DELETE_POST_NOTE", postId: note.postId, noteId: note.id });
                    navigate("post");
                  }
                },
              },
            ]}
          />
        </div>
      </div>
      <div className="note-page" id="note-page-body">
        {state.noteMode === "view" ? <NoteView note={note} onOpenPost={openPost} /> : <NoteEdit note={note} />}
      </div>
    </>
  );
}

function NoteView({ note, onOpenPost }: { note: ActiveNote; onOpenPost: (id: number) => void }) {
  const { dispatch } = useApp();
  const titleRef = useRef<HTMLDivElement>(null);
  useFitTitleSize(titleRef, note.title, false);
  const setEdit = () => dispatch({ type: "SET_STATE", patch: { noteMode: "edit" } });
  const toggleAi = () => {
    if (note.isGlobal) {
      dispatch({
        type: "UPSERT_GLOBAL_NOTE",
        note: { ...note, ai: !note.ai },
      });
      dispatch({ type: "SET_STATE", patch: { currentNote: { ...note, ai: !note.ai } } });
    }
  };
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
          <div className="note-ctrl">
            {note.isGlobal ? (
              <button className={`ai-toggle${note.ai ? " on" : ""}`} onClick={toggleAi} type="button">
                {note.ai ? "● Учитывать ИИ" : "○ Учитывать ИИ"}
              </button>
            ) : null}
            <button className="btn btn-ghost btn-sm" onClick={setEdit} type="button">
              Ред.
            </button>
            <button className="btn btn-primary btn-sm" disabled type="button">
              Сохранить
            </button>
          </div>
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
  const { dispatch, navigate, setDirty } = useApp();
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

  const save = () => {
    if (note.isGlobal) {
      const next = { ...note, title: title.trim() || note.title, body, files };
      dispatch({ type: "UPSERT_GLOBAL_NOTE", note: next });
      dispatch({ type: "SET_STATE", patch: { currentNote: next, noteMode: "view" } });
    } else {
      dispatch({
        type: "UPDATE_POST_NOTE",
        postId: note.postId,
        noteId: note.id,
        patch: { title: title.trim() || note.title, body, files },
      });
      dispatch({
        type: "SET_STATE",
        patch: {
          currentNote: { ...note, title: title.trim() || note.title, body, files },
          noteMode: "view",
        },
      });
    }
  };

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
          <div className="note-ctrl">
            <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()} type="button">
              📎 Файл
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch({ type: "SET_STATE", patch: { noteMode: "view" } })}
              type="button"
            >
              Просмотр
            </button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={!changed} type="button">
              Сохранить
            </button>
          </div>
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
