"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { postTitle } from "@/lib/helpers";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import PageHeader from "../PageHeader";
import PageHeaderSearchInput from "../PageHeaderSearchInput";
import PageHeaderSelect from "../PageHeaderSelect";
import NoteCardAiToggle from "../note/NoteCardAiToggle";
import NotesScopeFilterSelect from "../note/NotesScopeFilterSelect";
import NoteListCardMenu from "../note/NoteListCardMenu";
import { buildNoteSnapshot, EMPTY_NOTE_SNAPSHOT } from "@/lib/noteDraft";
import { routes } from "@/lib/routes";
import type { GlobalNote, LocalNote, NoteFile } from "@/lib/types";

type AnyNote =
  | (GlobalNote & { isGlobal: true })
  | (LocalNote & { isGlobal: false; postId: number; postTitle: string });

export default function NotesScreen() {
  const { state, dispatch, goToHref } = useApp();
  const isMobile = useMobile760();
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
      goToHref(routes.noteGlobal(n.id as string));
    } else {
      goToHref(routes.notePost(n.postId, n.id as number));
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
    goToHref(routes.noteNew("notes"));
  };

  const notesContextFilterSelectProps = {
    ariaLabel: "Контекст заметок",
    value: filter,
    options: [
      { value: "all", label: "Все" },
      { value: "ai", label: "В контексте" },
      { value: "noai", label: "Не в контексте" },
    ],
    onChange: (v: string) =>
      dispatch({
        type: "SET_STATE",
        patch: { noteFilter: v as typeof filter },
      }),
  };

  return (
    <>
      <PageHeader
        title="Заметки"
        backTo="home"
        mobileSelect={
          isMobile ? <PageHeaderSelect {...notesContextFilterSelectProps} /> : undefined
        }
        search={
          <div className="page-header-search-tools-row">
            <PageHeaderSearchInput
              placeholder="Поиск по заметкам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onDismiss={() => setSearch("")}
            />
            {!isMobile ? (
              <div
                className="notes-scope-tabs page-header-toolbar--desktop"
                role="tablist"
                aria-label="Область заметок"
              >
                {(
                  [
                    { key: "all", label: "Все" },
                    { key: "global", label: "Глобальные" },
                    { key: "local", label: "Локальные" },
                  ] as const
                ).map(({ key, label }) => (
                  <div
                    key={key}
                    role="tab"
                    aria-selected={scope === key}
                    className={`notes-scope-tab${scope === key ? " active" : ""}`}
                    onClick={() =>
                      dispatch({ type: "SET_STATE", patch: { noteScope: key } })
                    }
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        }
      />
      <div className="notes-page">
        <div className="notes-filter-row">
          {isMobile ? (
            <NotesScopeFilterSelect
              value={scope}
              onChange={(v) => dispatch({ type: "SET_STATE", patch: { noteScope: v } })}
            />
          ) : (
            <>
              {(["all", "ai", "noai"] as const).map((k) => (
                <div
                  key={k}
                  className={`filter-tab${filter === k ? " active" : ""}`}
                  onClick={() => dispatch({ type: "SET_STATE", patch: { noteFilter: k } })}
                >
                  {k === "all" ? "Все" : k === "ai" ? "В контексте ИИ" : "Не в контексте ИИ"}
                </div>
              ))}
            </>
          )}
          {scope === "global" || scope === "all" ? (
            <button
              type="button"
              className={`filter-tab active notes-new-note-btn${isMobile ? " filter-tab--dropdown" : ""}`}
              onClick={newGlobal}
            >
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
                    <div className="note-card-footer-start">
                      <NoteCardAiToggle
                        ai={n.ai}
                        onClick={() => toggleAi(n)}
                      />
                    </div>
                    <span className="note-card-meta-pg">
                      {n.date} · {n.isGlobal ? "Глобальная" : "Локальная"}
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
