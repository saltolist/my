"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ContextMenu } from "@/components/ContextMenu";
import { useApp } from "@/state/AppContext";
import type { ScreenId, NoteFile } from "@/lib/types";
import {
  NavIconAnalytics,
  NavIconChats,
  NavIconFeed,
  NavIconNotes,
  NavIconPlus,
  NavIconProfile,
} from "@/components/sidebar/NavIcons";

/** Градиентный знак ✦: размер и сдвиг по вертикали задаются в CSS (`.sidebar-brand-star-svg`). */
function BrandStarIcon() {
  const gid = useId().replace(/:/g, "");
  const gradId = `sb-brand-grad-${gid}`;
  return (
    <svg className="sidebar-brand-star-svg" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      {/* Ромб по центру (12,12); без текста — нет сдвига по baseline шрифта */}
      <path fill={`url(#${gradId})`} d="M12 3.25L19.25 12L12 20.75L4.75 12Z" />
    </svg>
  );
}

const NAV_MAP: Record<string, ScreenId> = {
  home: "home",
  feed: "feed",
  post: "feed",
  gchat: "chats",
  note: "notes",
  chats: "chats",
  notes: "notes",
  analytics: "analytics",
  profile: "profile",
};

type RecentRow =
  | {
      kind: "global";
      key: string;
      id: string;
      title: string;
      historyLen: number;
      seq: number;
    }
  | {
      kind: "local";
      key: string;
      postId: number;
      chatId: number;
      title: string;
      historyLen: number;
      seq: number;
    };

type RecentChatsModel =
  | { mode: "flat"; rows: RecentRow[] }
  | { mode: "grouped"; thisPost: RecentRow[]; others: RecentRow[] };

type RecentNoteRow =
  | {
      kind: "global";
      key: string;
      id: string;
      title: string;
      weight: number;
      seq: number;
    }
  | {
      kind: "local";
      key: string;
      postId: number;
      noteId: number;
      title: string;
      weight: number;
      seq: number;
    };

type RecentNotesModel =
  | { mode: "flat"; rows: RecentNoteRow[] }
  | { mode: "grouped"; thisPost: RecentNoteRow[]; others: RecentNoteRow[] };

const RECENT_SIDEBAR_MAX = 14;
const SIDEBAR_COLLAPSED_KEY = "tg-demo-sidebar-collapsed";
const RAIL_MQ = "(min-width: 761px)";

export default function Sidebar() {
  const { state, navigate, goHome, openGChat, navigateWithState, dispatch } = useApp();
  const activeNav = NAV_MAP[state.screen];
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [recentMenuOpenKey, setRecentMenuOpenKey] = useState<string | null>(null);
  const [recentNotesMenuOpenKey, setRecentNotesMenuOpenKey] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [railAllowed, setRailAllowed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(RAIL_MQ);
    const sync = () => setRailAllowed(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
    } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    const collapsed = railAllowed && sidebarCollapsed;
    document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
    return () => document.documentElement.classList.remove("sidebar-collapsed");
  }, [railAllowed, sidebarCollapsed]);

  useEffect(() => {
    if (railAllowed && sidebarCollapsed) {
      setChatsExpanded(false);
      setNotesExpanded(false);
    }
  }, [railAllowed, sidebarCollapsed]);

  const recentChatsModel = useMemo((): RecentChatsModel => {
    const byActivity = (a: RecentRow, b: RecentRow) =>
      b.historyLen - a.historyLen || a.seq - b.seq;

    const globalRows: RecentRow[] = [];
    let gSeq = 0;
    for (const c of state.globalChats) {
      globalRows.push({
        kind: "global",
        key: `g:${c.id}`,
        id: c.id,
        title: c.title || "Без названия",
        historyLen: c.history.length,
        seq: gSeq++,
      });
    }
    globalRows.sort(byActivity);

    const inPostSpace =
      state.screen === "post" &&
      state.currentPostId != null &&
      state.posts.some((p) => p.id === state.currentPostId);

    if (!inPostSpace) {
      const allLocal: RecentRow[] = [];
      let seq = 0;
      for (const p of state.posts) {
        for (const c of p.chats) {
          allLocal.push({
            kind: "local",
            key: `l:${p.id}-${c.id}`,
            postId: p.id,
            chatId: c.id,
            title: c.title || "Без названия",
            historyLen: c.history.length,
            seq: seq++,
          });
        }
      }
      const mixed = [...globalRows, ...allLocal];
      mixed.sort(byActivity);
      return { mode: "flat", rows: mixed.slice(0, RECENT_SIDEBAR_MAX) };
    }

    const post = state.posts.find((p) => p.id === state.currentPostId)!;
    const thisPostRows: RecentRow[] = [];
    let tpSeq = 0;
    for (const c of post.chats) {
      thisPostRows.push({
        kind: "local",
        key: `l:${post.id}-${c.id}`,
        postId: post.id,
        chatId: c.id,
        title: c.title || "Без названия",
        historyLen: c.history.length,
        seq: tpSeq++,
      });
    }
    thisPostRows.sort(byActivity);

    const othersRows: RecentRow[] = [];
    let oSeq = 0;
    for (const c of state.globalChats) {
      othersRows.push({
        kind: "global",
        key: `g:${c.id}`,
        id: c.id,
        title: c.title || "Без названия",
        historyLen: c.history.length,
        seq: oSeq++,
      });
    }
    for (const p of state.posts) {
      if (p.id === post.id) continue;
      for (const c of p.chats) {
        othersRows.push({
          kind: "local",
          key: `l:${p.id}-${c.id}`,
          postId: p.id,
          chatId: c.id,
          title: c.title || "Без названия",
          historyLen: c.history.length,
          seq: oSeq++,
        });
      }
    }
    othersRows.sort(byActivity);

    const thisPost = thisPostRows.slice(0, RECENT_SIDEBAR_MAX);
    const others = othersRows.slice(0, Math.max(0, RECENT_SIDEBAR_MAX - thisPost.length));

    return { mode: "grouped", thisPost, others };
  }, [state.globalChats, state.posts, state.screen, state.currentPostId]);

  const recentNotesModel = useMemo((): RecentNotesModel => {
    const noteWeight = (body: string) => body?.length ?? 0;

    const byActivity = (a: RecentNoteRow, b: RecentNoteRow) =>
      b.weight - a.weight || a.seq - b.seq;

    const globalRows: RecentNoteRow[] = [];
    let gSeq = 0;
    for (const n of state.globalNotes) {
      globalRows.push({
        kind: "global",
        key: `ng:${n.id}`,
        id: n.id,
        title: n.title || "Без названия",
        weight: noteWeight(n.body),
        seq: gSeq++,
      });
    }
    globalRows.sort(byActivity);

    const inPostSpace =
      state.screen === "post" &&
      state.currentPostId != null &&
      state.posts.some((p) => p.id === state.currentPostId);

    if (!inPostSpace) {
      const allLocal: RecentNoteRow[] = [];
      let seq = 0;
      for (const p of state.posts) {
        for (const n of p.notes) {
          allLocal.push({
            kind: "local",
            key: `nl:${p.id}-${n.id}`,
            postId: p.id,
            noteId: n.id,
            title: n.title || "Без названия",
            weight: noteWeight(n.body),
            seq: seq++,
          });
        }
      }
      const mixed = [...globalRows, ...allLocal];
      mixed.sort(byActivity);
      return { mode: "flat", rows: mixed.slice(0, RECENT_SIDEBAR_MAX) };
    }

    const post = state.posts.find((p) => p.id === state.currentPostId)!;
    const thisPostRows: RecentNoteRow[] = [];
    let tpSeq = 0;
    for (const n of post.notes) {
      thisPostRows.push({
        kind: "local",
        key: `nl:${post.id}-${n.id}`,
        postId: post.id,
        noteId: n.id,
        title: n.title || "Без названия",
        weight: noteWeight(n.body),
        seq: tpSeq++,
      });
    }
    thisPostRows.sort(byActivity);

    const othersRows: RecentNoteRow[] = [];
    let oSeq = 0;
    for (const n of state.globalNotes) {
      othersRows.push({
        kind: "global",
        key: `ng:${n.id}`,
        id: n.id,
        title: n.title || "Без названия",
        weight: noteWeight(n.body),
        seq: oSeq++,
      });
    }
    for (const p of state.posts) {
      if (p.id === post.id) continue;
      for (const n of p.notes) {
        othersRows.push({
          kind: "local",
          key: `nl:${p.id}-${n.id}`,
          postId: p.id,
          noteId: n.id,
          title: n.title || "Без названия",
          weight: noteWeight(n.body),
          seq: oSeq++,
        });
      }
    }
    othersRows.sort(byActivity);

    const thisPost = thisPostRows.slice(0, RECENT_SIDEBAR_MAX);
    const others = othersRows.slice(0, Math.max(0, RECENT_SIDEBAR_MAX - thisPost.length));

    return { mode: "grouped", thisPost, others };
  }, [state.globalNotes, state.posts, state.screen, state.currentPostId]);

  const openLocalChat = (postId: number, chatId: number) => {
    navigateWithState({
      currentPostId: postId,
      currentPostChatId: chatId,
      postMode: "chat",
      postViewStack: [],
      isEditing: false,
      screen: "post",
    });
  };

  const isRecentActive = (row: RecentRow) => {
    if (row.kind === "global") {
      return state.screen === "gchat" && state.currentGChatId === row.id;
    }
    return (
      state.screen === "post" &&
      state.currentPostId === row.postId &&
      state.currentPostChatId === row.chatId
    );
  };

  const renderRecentChatRow = (row: RecentRow) => (
    <div
      key={row.key}
      className={`nav-recent-chat-row${isRecentActive(row) ? " active" : ""}${
        recentMenuOpenKey === row.key ? " nav-recent-chat-row--menu" : ""
      }`}
    >
      <button
        type="button"
        className="nav-recent-chat"
        onClick={() => {
          if (row.kind === "global") openGChat(row.id);
          else openLocalChat(row.postId, row.chatId);
        }}
      >
        <span className="nav-recent-chat-title">{row.title}</span>
      </button>
      <ContextMenu
        className="nav-recent-chat-ctx"
        align="left"
        portal
        onOpenChange={(next) => setRecentMenuOpenKey(next ? row.key : null)}
        trigger={<span className="nav-recent-chat-dots">⋯</span>}
        items={[
          {
            label: "Переименовать",
            icon: "✎",
            onClick: () => {
              const next = window.prompt("Новое название чата", row.title);
              if (next == null) return;
              const t = next.trim();
              if (!t) return;
              if (row.kind === "global") {
                dispatch({ type: "RENAME_GLOBAL_CHAT", chatId: row.id, title: t });
              } else {
                dispatch({
                  type: "RENAME_LOCAL_CHAT",
                  postId: row.postId,
                  chatId: row.chatId,
                  title: t,
                });
              }
            },
          },
          {
            label: "Удалить чат",
            icon: "🗑",
            danger: true,
            onClick: () => {
              if (!window.confirm(`Удалить чат «${row.title}»?`)) return;
              if (row.kind === "global") {
                dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: row.id });
                if (state.screen === "gchat" && state.currentGChatId === row.id) {
                  navigate("chats", { skipHistory: true });
                }
              } else {
                dispatch({
                  type: "DELETE_LOCAL_CHAT",
                  postId: row.postId,
                  chatId: row.chatId,
                });
              }
            },
          },
        ]}
      />
    </div>
  );

  const openNoteFromRow = (row: RecentNoteRow) => {
    if (row.kind === "global") {
      const n = state.globalNotes.find((x) => x.id === row.id);
      if (!n) return;
      const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
      navigateWithState({
        screen: "note",
        currentNote: { ...n, isGlobal: true, files },
        noteFrom: "notes",
        noteMode: "view",
        noteSavedSnapshot: JSON.stringify({ title: n.title, body: n.body, ai: n.ai, files }),
      });
    } else {
      const post = state.posts.find((p) => p.id === row.postId);
      const n = post?.notes.find((x) => x.id === row.noteId);
      if (!n || !post) return;
      const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
      const noteFrom =
        state.screen === "post" && state.currentPostId === row.postId ? ("post" as const) : ("notes" as const);
      navigateWithState({
        screen: "note",
        currentNote: { ...n, isGlobal: false, postId: row.postId, files },
        noteFrom,
        noteMode: "view",
        noteSavedSnapshot: JSON.stringify({ title: n.title, body: n.body, ai: n.ai, files }),
      });
    }
  };

  const isRecentNoteActive = (row: RecentNoteRow) => {
    if (state.screen !== "note" || !state.currentNote) return false;
    if (row.kind === "global") {
      return state.currentNote.isGlobal === true && state.currentNote.id === row.id;
    }
    return (
      state.currentNote.isGlobal === false &&
      state.currentNote.postId === row.postId &&
      state.currentNote.id === row.noteId
    );
  };

  const renderRecentNoteRow = (row: RecentNoteRow) => (
    <div
      key={row.key}
      className={`nav-recent-chat-row${isRecentNoteActive(row) ? " active" : ""}${
        recentNotesMenuOpenKey === row.key ? " nav-recent-chat-row--menu" : ""
      }`}
    >
      <button type="button" className="nav-recent-chat" onClick={() => openNoteFromRow(row)}>
        <span className="nav-recent-chat-title">{row.title}</span>
      </button>
      <ContextMenu
        className="nav-recent-chat-ctx"
        align="left"
        portal
        onOpenChange={(next) => setRecentNotesMenuOpenKey(next ? row.key : null)}
        trigger={<span className="nav-recent-chat-dots">⋯</span>}
        items={[
          {
            label: "Переименовать",
            icon: "✎",
            onClick: () => {
              const next = window.prompt("Новое название заметки", row.title);
              if (next == null) return;
              const t = next.trim();
              if (!t) return;
              if (row.kind === "global") {
                const n = state.globalNotes.find((x) => x.id === row.id);
                if (!n) return;
                dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, title: t } });
              } else {
                dispatch({
                  type: "UPDATE_POST_NOTE",
                  postId: row.postId,
                  noteId: row.noteId,
                  patch: { title: t },
                });
              }
            },
          },
          {
            label: "Удалить заметку",
            icon: "🗑",
            danger: true,
            onClick: () => {
              if (!window.confirm(`Удалить заметку «${row.title}»?`)) return;
              if (row.kind === "global") {
                dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: row.id });
                const cur = state.currentNote;
                if (state.screen === "note" && cur?.isGlobal === true && cur.id === row.id) {
                  navigate("notes", { skipHistory: true });
                }
              } else {
                dispatch({ type: "DELETE_POST_NOTE", postId: row.postId, noteId: row.noteId });
                const cur = state.currentNote;
                if (
                  state.screen === "note" &&
                  cur &&
                  cur.isGlobal === false &&
                  cur.postId === row.postId &&
                  cur.id === row.noteId
                ) {
                  navigate("notes", { skipHistory: true });
                }
              }
            },
          },
        ]}
      />
    </div>
  );

  const railActive = railAllowed && sidebarCollapsed;

  return (
    <nav id="sidebar" className={railActive ? "sidebar--collapsed" : undefined}>
      <div className="sidebar-header">
        {railAllowed ? (
          railActive ? (
            <button
              type="button"
              className="sidebar-brand-mark-hit"
              onClick={() => setSidebarCollapsed(false)}
              aria-pressed
              aria-label="Развернуть панель"
              title="Развернуть панель"
            >
              <span className="sidebar-brand-mark-layer sidebar-brand-mark-layer--logo">
                <span className="sidebar-brand-mark" aria-hidden>
                  <BrandStarIcon />
                </span>
              </span>
              <span className="sidebar-brand-mark-layer sidebar-brand-mark-layer--toggle" aria-hidden>
                <RailPanelToggleIcon />
              </span>
            </button>
          ) : (
            <div className="sidebar-brand-split">
              <button type="button" className="sidebar-brand" onClick={goHome} title="TG Platform" aria-label="TG Platform — на главную">
                <span className="sidebar-brand-mark" aria-hidden>
                  <BrandStarIcon />
                </span>
                <span className="sidebar-brand-name">TG Platform</span>
              </button>
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Свернуть панель"
                title="Свернуть панель"
              >
                <span className="sidebar-collapse-btn-inner" aria-hidden>
                  <RailPanelToggleIcon />
                </span>
              </button>
            </div>
          )
        ) : (
          <button type="button" className="sidebar-brand" onClick={goHome} title="TG Platform" aria-label="TG Platform — на главную">
            <span className="sidebar-brand-mark" aria-hidden>
              <BrandStarIcon />
            </span>
            <span className="sidebar-brand-name">TG Platform</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className={`nav-item${activeNav === "home" ? " active" : ""}`}
        onClick={goHome}
        title="Глобальный чат"
        aria-label="Глобальный чат"
      >
        <span className="nav-icon">
          <NavIconPlus />
        </span>
        <span className="nav-label">Глобальный чат</span>
      </button>

      <div className="nav-items">
        <NavItem id="feed" label="Лента" icon={<NavIconFeed />} active={activeNav === "feed"} onClick={() => navigate("feed")} />
        <NavItem
          id="analytics"
          label="Аналитика"
          icon={<NavIconAnalytics />}
          active={activeNav === "analytics"}
          onClick={() => navigate("analytics")}
        />
        <div id="nav-notes" className={`nav-item nav-item--chats-row${activeNav === "notes" ? " active" : ""}`}>
          <button type="button" className="nav-item-chats-main" onClick={() => navigate("notes")}>
            <span className="nav-icon">
              <NavIconNotes />
            </span>
            <span className="nav-label">Заметки</span>
          </button>
          <button
            type="button"
            className={`nav-chats-chevron${notesExpanded ? " is-expanded" : " is-collapsed"}`}
            aria-expanded={notesExpanded}
            aria-label={notesExpanded ? "Свернуть список заметок" : "Развернуть список заметок"}
            onClick={(e) => {
              e.stopPropagation();
              setNotesExpanded((v) => !v);
            }}
          >
            <svg
              className="nav-chats-chevron-svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {notesExpanded ? (
          <div className="nav-recent-chats">
            {recentNotesModel.mode === "flat" ? (
              recentNotesModel.rows.map((row) => renderRecentNoteRow(row))
            ) : (
              <>
                <div className="nav-recent-chats-section-label">Этот пост</div>
                {recentNotesModel.thisPost.map((row) => renderRecentNoteRow(row))}
                <div className="nav-recent-chats-section-label">Остальные</div>
                {recentNotesModel.others.map((row) => renderRecentNoteRow(row))}
              </>
            )}
          </div>
        ) : null}

        <div className={`nav-item nav-item--chats-row${activeNav === "chats" ? " active" : ""}`}>
          <button type="button" className="nav-item-chats-main" onClick={() => navigate("chats")}>
            <span className="nav-icon">
              <NavIconChats />
            </span>
            <span className="nav-label">Чаты</span>
          </button>
          <button
            type="button"
            className={`nav-chats-chevron${chatsExpanded ? " is-expanded" : " is-collapsed"}`}
            aria-expanded={chatsExpanded}
            aria-label={chatsExpanded ? "Свернуть список чатов" : "Развернуть список чатов"}
            onClick={(e) => {
              e.stopPropagation();
              setChatsExpanded((v) => !v);
            }}
          >
            <svg
              className="nav-chats-chevron-svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {chatsExpanded ? (
          <div className="nav-recent-chats">
            {recentChatsModel.mode === "flat" ? (
              recentChatsModel.rows.map((row) => renderRecentChatRow(row))
            ) : (
              <>
                <div className="nav-recent-chats-section-label">Этот пост</div>
                {recentChatsModel.thisPost.map((row) => renderRecentChatRow(row))}
                <div className="nav-recent-chats-section-label">Остальные</div>
                {recentChatsModel.others.map((row) => renderRecentChatRow(row))}
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="sidebar-bottom">
        <NavItem
          id="profile"
          label="Профиль"
          icon={<NavIconProfile />}
          active={activeNav === "profile"}
          onClick={() => navigate("profile")}
        />
      </div>
    </nav>
  );
}

/** Иконка «панель с боковым столбцом» — сворачивание / разворачивание rail */
function RailPanelToggleIcon() {
  return (
    <svg className="sidebar-rail-toggle-svg" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1="9.25" y1="8.25" x2="9.25" y2="15.75" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function NavItem({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div id={`nav-${id}`} className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </div>
  );
}
