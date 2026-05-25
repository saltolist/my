"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { parseAppPath, routes, screenFromPath } from "@/lib/routes";
import { ContextMenu } from "@/components/ContextMenu";
import { usePostCtxMenuItems } from "@/components/post/postCtxMenu";
import { useApp } from "@/state/AppContext";
import { buildNoteSnapshot } from "@/lib/noteDraft";
import { postTitle } from "@/lib/helpers";
import type { NoteFile } from "@/lib/types";
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
  const {
    state,
    navigate,
    goHome,
    openPost,
    openGChat,
    goToHref,
    dispatch,
    confirmDiscardAnyEdit,
    discardPendingEdits,
  } = useApp();
  const pathname = usePathname() ?? "/";
  const route = parseAppPath(pathname);
  const screen = screenFromPath(pathname);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [recentMenuOpenKey, setRecentMenuOpenKey] = useState<string | null>(null);
  const [recentNotesMenuOpenKey, setRecentNotesMenuOpenKey] = useState<string | null>(null);
  const [feedPostMenuOpen, setFeedPostMenuOpen] = useState(false);
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

  useEffect(() => {
    if (screen === "note") setNotesExpanded(true);
    if (screen === "gchat") setChatsExpanded(true);
    if (screen === "post" && state.postMode === "notes") setNotesExpanded(true);
  }, [screen, state.postMode]);

  const sidebarPostId = useMemo((): number | null => {
    if (screen === "post" && route.postId != null) return route.postId;
    const note = state.currentNote;
    if (screen === "note" && note && !note.isGlobal) return note.postId;
    return null;
  }, [screen, route.postId, state.currentNote]);

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
      sidebarPostId != null && state.posts.some((p) => p.id === sidebarPostId);

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

    const post = state.posts.find((p) => p.id === sidebarPostId)!;
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
  }, [state.globalChats, state.posts, sidebarPostId]);

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
      sidebarPostId != null && state.posts.some((p) => p.id === sidebarPostId);

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

    const post = state.posts.find((p) => p.id === sidebarPostId)!;
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
  }, [state.globalNotes, state.posts, sidebarPostId]);

  const currentPostSidebar = useMemo(() => {
    if (sidebarPostId == null) return null;
    return state.posts.find((p) => p.id === sidebarPostId) ?? null;
  }, [sidebarPostId, state.posts]);

  const showFeedPostRow =
    sidebarPostId != null &&
    (screen === "post" || (screen === "note" && state.currentNote != null && !state.currentNote.isGlobal));

  // Полностью активна — на странице поста, но не внутри конкретного чата или заметки
  const isSidebarPostFullActive =
    sidebarPostId != null &&
    screen === "post" &&
    state.currentPostId === sidebarPostId &&
    !(state.postMode === "chat" && state.currentPostChatId != null);

  // Приглушённо активна (как hover) — в чате или заметке этого поста
  const isSidebarPostSubActive =
    sidebarPostId != null &&
    !isSidebarPostFullActive &&
    ((screen === "post" &&
      state.currentPostId === sidebarPostId &&
      state.postMode === "chat" &&
      state.currentPostChatId != null) ||
      (screen === "note" &&
        state.currentNote != null &&
        !state.currentNote.isGlobal &&
        state.currentNote.postId === sidebarPostId));

  const { items: feedPostCtxItems, modal: scheduleModal } = usePostCtxMenuItems(currentPostSidebar);

  const openLocalChat = (postId: number, chatId: number) => {
    goToHref(routes.post(postId, chatId));
  };

  const isRecentActive = (row: RecentRow) => {
    if (row.kind === "global") {
      return screen === "gchat" && route.gchatId === row.id;
    }
    return (
      screen === "post" &&
      route.postId === row.postId &&
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
                if (screen === "gchat" && route.gchatId === row.id) {
                  goToHref(routes.chats(), { replace: true });
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
      goToHref(routes.noteGlobal(row.id));
    } else {
      const post = state.posts.find((p) => p.id === row.postId);
      const n = post?.notes.find((x) => x.id === row.noteId);
      if (!n || !post) return;
      const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
      const noteFrom =
        sidebarPostId != null && row.postId === sidebarPostId ? ("post" as const) : ("notes" as const);
      goToHref(routes.notePost(row.postId, row.noteId));
    }
  };

  const isRecentNoteActive = (row: RecentNoteRow) => {
    if (screen !== "note" || !state.currentNote) return false;
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
                if (screen === "note" && cur?.isGlobal === true && cur.id === row.id) {
                  goToHref(routes.notes(), { replace: true });
                }
              } else {
                dispatch({ type: "DELETE_POST_NOTE", postId: row.postId, noteId: row.noteId });
                const cur = state.currentNote;
                if (
                  screen === "note" &&
                  cur &&
                  cur.isGlobal === false &&
                  cur.postId === row.postId &&
                  cur.id === row.noteId
                ) {
                  goToHref(routes.notes(), { replace: true });
                }
              }
            },
          },
        ]}
      />
    </div>
  );

  const railActive = railAllowed && sidebarCollapsed;

  const openNotesNav = () => {
    if (railAllowed && sidebarCollapsed) setSidebarCollapsed(false);
    navigate("notes");
  };

  const openChatsNav = () => {
    if (railAllowed && sidebarCollapsed) setSidebarCollapsed(false);
    navigate("chats");
  };

  return (
    <>
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

      <div className="nav-items">
        <button
          type="button"
          className={`nav-item${screen === "home" ? " active" : ""}`}
          onClick={goHome}
          title="Глобальный чат"
          aria-label="Глобальный чат"
        >
          <span className="nav-icon">
            <NavIconPlus />
          </span>
          <span className="nav-label">Глобальный чат</span>
        </button>
        <NavItem
          id="analytics"
          label="Аналитика"
          icon={<NavIconAnalytics />}
          active={screen === "analytics"}
          onClick={() => navigate("analytics")}
        />
        <NavItem id="feed" label="Лента" icon={<NavIconFeed />} active={screen === "feed"} onClick={() => navigate("feed")} />
        {showFeedPostRow && currentPostSidebar ? (
          <div className="nav-recent-chats">
            <div
              className={`nav-recent-chat-row${isSidebarPostFullActive ? " active" : isSidebarPostSubActive ? " sub-active" : ""}${
                feedPostMenuOpen ? " nav-recent-chat-row--menu" : ""
              }`}
            >
              <button
                type="button"
                className="nav-recent-chat"
                onClick={() => openPost(currentPostSidebar.id)}
              >
                <span className="nav-recent-chat-title">{postTitle(currentPostSidebar)}</span>
              </button>
              <ContextMenu
                className="nav-recent-chat-ctx"
                align="left"
                portal
                onOpenChange={setFeedPostMenuOpen}
                trigger={<span className="nav-recent-chat-dots">⋯</span>}
                items={feedPostCtxItems}
              />
            </div>
          </div>
        ) : null}
        <div id="nav-notes" className={`nav-item nav-item--chats-row${screen === "notes" ? " active" : ""}`}>
          <button type="button" className="nav-item-chats-main" onClick={openNotesNav}>
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
                {recentNotesModel.thisPost.length === 0 ? (
                  <div className="nav-recent-empty">Заметок нет</div>
                ) : (
                  recentNotesModel.thisPost.map((row) => renderRecentNoteRow(row))
                )}
                <div className="nav-recent-chats-section-label">Остальные</div>
                {recentNotesModel.others.length === 0 ? (
                  <div className="nav-recent-empty">Заметок нет</div>
                ) : (
                  recentNotesModel.others.map((row) => renderRecentNoteRow(row))
                )}
              </>
            )}
          </div>
        ) : null}

        <div className={`nav-item nav-item--chats-row${screen === "chats" ? " active" : ""}`}>
          <button type="button" className="nav-item-chats-main" onClick={openChatsNav}>
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
                {recentChatsModel.thisPost.length === 0 ? (
                  <div className="nav-recent-empty">Чатов нет</div>
                ) : (
                  recentChatsModel.thisPost.map((row) => renderRecentChatRow(row))
                )}
                <div className="nav-recent-chats-section-label">Остальные</div>
                {recentChatsModel.others.length === 0 ? (
                  <div className="nav-recent-empty">Чатов нет</div>
                ) : (
                  recentChatsModel.others.map((row) => renderRecentChatRow(row))
                )}
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
          active={screen === "profile"}
          onClick={() => navigate("profile")}
        />
      </div>
      </nav>
      {scheduleModal}
    </>
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
