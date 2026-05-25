"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { postTitle } from "@/lib/helpers";
import PageHeader from "../PageHeader";
import PageHeaderSearchInput from "../PageHeaderSearchInput";
import PageHeaderSelect from "../PageHeaderSelect";
import NoteCardAiToggle from "../note/NoteCardAiToggle";
import NoteListCardMenu from "../note/NoteListCardMenu";
import { buildNoteSnapshot, createNewGlobalNote, EMPTY_NOTE_SNAPSHOT } from "@/lib/noteDraft";
import type { GlobalNote, LocalNote, NoteFile } from "@/lib/types";

type AnyNote =
  | (GlobalNote & { isGlobal: true })
  | (LocalNote & { isGlobal: false; postId: number; postTitle: string });

export default function NotesScreen() {
  const { state, dispatch, navigateWithState, openPost, pushRouteSnapshot, canLeaveCurrentScreen } = useApp();
  const [search, setSearch] = useState("");
  const scope = state.noteScope;
  const filter = state.noteFilter;

  const globalItems: AnyNote[] = state.globalNotes.map((n) => ({ ...n, isGlobal: true }));
  const localItems: AnyNote[] = state.posts.flatMap((p) =>
    p.notes.map((n) => ({
      ...n,
      isGlobal: false as const,
      postId: p.id,
      postTitle: postTitle(p),
    })),
  );
  const items: AnyNote[] =
    scope === "global" ? globalItems : scope === "local" ? localItems : [...globalItems, ...localItems];

  const q = search.toLowerCase();
  const filtered = items.filter((n) => {
    if (filter === "ai" && !n.ai) return false;
    if (filter === "noai" && n.ai) return false;
    if (q && !n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
    return true;
  });

  const openNote = (n: AnyNote) => {
    if (n.isGlobal) {
      const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
      navigateWithState({
        screen: "note",
        currentNote: { ...n, files },
        noteFrom: "notes",
        noteMode: "view",
        noteSavedSnapshot: buildNoteSnapshot(n.title, n.body, n.ai, files),
      });
    } else {
      const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
      navigateWithState({
        screen: "note",
        currentNote: { ...n, isGlobal: false, postId: n.postId, files },
        noteFrom: "notes",
        noteMode: "view",
        noteSavedSnapshot: buildNoteSnapshot(n.title, n.body, n.ai, files),
      });
    }
  };

  const toggleAi = (n: AnyNote) => {
    if (n.isGlobal) {
      dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, ai: !n.ai } });
    } else {
      dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: n.postId, noteId: n.id });
    }
  };

  const newGlobal = () => {
    if (!canLeaveCurrentScreen("note")) return;
    pushRouteSnapshot();
    dispatch({
      type: "SET_STATE",
      patch: {
        screen: "note",
        currentNote: createNewGlobalNote(),
        noteFrom: "notes",
        noteMode: "edit",
        noteSavedSnapshot: EMPTY_NOTE_SNAPSHOT,
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Заметки"
        backTo="home"
        mobileSelect={
          <PageHeaderSelect
            ariaLabel="Область заметок"
            value={scope}
            options={[
              { value: "all", label: "Все" },
              { value: "global", label: "Глобальные" },
              { value: "local", label: "Локальные" },
            ]}
            onChange={(v) =>
              dispatch({
                type: "SET_STATE",
                patch: { noteScope: v as typeof scope },
              })
            }
          />
        }
        search={
          <div className="page-header-search-tools-row">
            <PageHeaderSearchInput
              placeholder="Поиск по заметкам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div
              className="notes-scope-tabs page-header-toolbar--desktop"
              role="tablist"
              aria-label="Область заметок"
            >
              <div
                role="tab"
                aria-selected={scope === "all"}
                className={`notes-scope-tab${scope === "all" ? " active" : ""}`}
                onClick={() => dispatch({ type: "SET_STATE", patch: { noteScope: "all" } })}
              >
                Все
              </div>
              <div
                role="tab"
                aria-selected={scope === "global"}
                className={`notes-scope-tab${scope === "global" ? " active" : ""}`}
                onClick={() => dispatch({ type: "SET_STATE", patch: { noteScope: "global" } })}
              >
                Глобальные
              </div>
              <div
                role="tab"
                aria-selected={scope === "local"}
                className={`notes-scope-tab${scope === "local" ? " active" : ""}`}
                onClick={() => dispatch({ type: "SET_STATE", patch: { noteScope: "local" } })}
              >
                Локальные
              </div>
            </div>
          </div>
        }
      />
      <div className="notes-page">
        <div className="notes-filter-row">
          {(["all", "ai", "noai"] as const).map((k) => (
            <div
              key={k}
              className={`filter-tab${filter === k ? " active" : ""}`}
              onClick={() => dispatch({ type: "SET_STATE", patch: { noteFilter: k } })}
            >
              {k === "all" ? "Все" : k === "ai" ? "В контексте ИИ" : "Не в контексте"}
            </div>
          ))}
          {scope === "global" || scope === "all" ? (
            <button type="button" className="filter-tab notes-new-note-btn" onClick={newGlobal}>
              + Новая заметка
            </button>
          ) : null}
        </div>
        <div className="notes-grid-page">
          <div className="notes-grid-layout">
            {filtered.length === 0 ? (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                <div className="eico">📝</div>
                <p>
                  {scope === "global"
                    ? "Нет глобальных заметок"
                    : scope === "local"
                      ? "Нет локальных заметок"
                      : "Нет заметок"}
                </p>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={`${n.isGlobal ? "g" : `l-${n.postId}`}-${n.id}`}
                  className="note-card-page"
                  onClick={() => openNote(n)}
                >
                  <div className="note-card-page-head">
                    <div className="note-card-name">{n.title}</div>
                    <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                      {n.isGlobal ? (
                        <NoteListCardMenu isGlobal noteId={n.id} title={n.title} />
                      ) : (
                        <NoteListCardMenu
                          isGlobal={false}
                          postId={n.postId}
                          noteId={n.id}
                          title={n.title}
                        />
                      )}
                    </div>
                  </div>
                  <div className="note-card-preview">{n.body}</div>
                  <div className="note-card-footer-pg">
                    <NoteCardAiToggle
                      ai={n.ai}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAi(n);
                      }}
                    />
                    <span className="note-card-date-pg">
                      {n.date} · {n.isGlobal ? "Глобальная" : "Локальная"}
                      {!n.isGlobal ? (
                        <>
                          {" · "}
                          <a
                            onClick={(e) => {
                              e.stopPropagation();
                              openPost(n.postId);
                            }}
                          >
                            к посту
                          </a>
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
