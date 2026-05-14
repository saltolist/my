"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { postById, useApp } from "@/state/AppContext";
import { postTitle, readFileAsMedia, truncate } from "@/lib/helpers";
import Composer from "../composer/Composer";
import ChatMessage from "../chat/ChatMessage";
import PostMediaBlock from "../post/PostMediaBlock";
import { PostReactionPills, PostViewsReposts } from "../feed/PostEngagement";
import { ContextMenu, type CtxMenuItem } from "../ContextMenu";
import type { LocalNote, NoteFile, PostMedia, PostMetrics, PostMode } from "@/lib/types";

export default function PostScreen() {
  const { state, dispatch, navigate, navigateBack, sendPost } = useApp();
  const post = postById(state, state.currentPostId);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const mediaItems: PostMedia[] = post?.media ?? [];
  const activeChat = post?.chats.find((c) => c.id === state.currentPostChatId) || null;
  const history = activeChat?.history ?? [];

  useEffect(() => {
    if (state.postMode === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history.length, state.postMode]);

  useEffect(() => {
    if (state.postMode !== "chat") {
      setShowJump(false);
      return;
    }
    const sync = () => {
      if (!chatScrollRef.current || !postCardRef.current) return;
      const sr = chatScrollRef.current.getBoundingClientRect();
      const cr = postCardRef.current.getBoundingClientRect();
      const hdr = chatScrollRef.current
        .closest(".screen")
        ?.querySelector<HTMLElement>(".post-hdr");
      const hdrH = hdr?.getBoundingClientRect().height ?? 0;
      setShowJump(cr.bottom < sr.top + hdrH + 8);
    };
    sync();
    const el = chatScrollRef.current;
    el?.addEventListener("scroll", sync);
    return () => el?.removeEventListener("scroll", sync);
  }, [state.postMode, state.isEditing, post?.id, activeChat?.id]);

  const pushPostView = (nextMode: PostMode, nextChatId: number | null) => {
    if (nextMode === state.postMode && nextChatId === state.currentPostChatId) return;
    const stack = [
      ...state.postViewStack,
      { mode: state.postMode, chatId: state.currentPostChatId },
    ];
    dispatch({
      type: "SET_STATE",
      patch: {
        postViewStack: stack,
        postMode: nextMode,
        currentPostChatId: nextChatId,
        isEditing: false,
      },
    });
  };
  const toggleMode = (target: "chats" | "notes") => {
    const next = state.postMode === target ? "chat" : target;
    pushPostView(next, state.currentPostChatId);
  };
  const openLocalChat = (chatId: number) => pushPostView("chat", chatId);
  const startNewChat = () => pushPostView("chat", null);
  const handleBack = () => {
    if (state.postViewStack.length > 0) {
      const stack = state.postViewStack.slice(0, -1);
      const prev = state.postViewStack[state.postViewStack.length - 1];
      dispatch({
        type: "SET_STATE",
        patch: {
          postViewStack: stack,
          postMode: prev.mode,
          currentPostChatId: prev.chatId,
          isEditing: false,
        },
      });
      return;
    }
    navigateBack("feed");
  };

  if (!post) {
    return (
      <div className="post-hdr">
        <div className="post-hdr-top">
          <div className="page-header-left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigateBack("feed")} type="button">
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ctxItems: CtxMenuItem[] = [
    {
      label: "Новый чат",
      icon: "✦",
      onClick: startNewChat,
    },
  ];
  if (post.status === "draft") {
    ctxItems.push({
      label: "Опубликовать",
      icon: "📢",
      onClick: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: { status: "published", date: "сегодня", metrics: { views: "0", reposts: 0, reactions: [] } },
        }),
    });
    ctxItems.push({
      label: "Запланировать",
      icon: "🕐",
      onClick: () =>
        dispatch({ type: "UPDATE_POST", postId: post.id, patch: { status: "scheduled", date: "10 мая 20:00" } }),
    });
  }
  if (post.status === "scheduled") {
    ctxItems.push({
      label: "Опубликовать",
      icon: "📢",
      onClick: () =>
        dispatch({
          type: "UPDATE_POST",
          postId: post.id,
          patch: { status: "published", date: "сегодня", metrics: { views: "0", reposts: 0, reactions: [] } },
        }),
    });
    ctxItems.push({
      label: "Отменить публикацию",
      icon: "✕",
      onClick: () =>
        dispatch({ type: "UPDATE_POST", postId: post.id, patch: { status: "draft", created: "сейчас" } }),
    });
  }
  ctxItems.push({
    label: "Удалить",
    icon: "🗑",
    danger: true,
    onClick: () => {
      if (!confirm(`Удалить пост «${postTitle(post)}»?`)) return;
      dispatch({ type: "DELETE_POST", postId: post.id });
      navigate("feed", { skipHistory: true, clearHistory: true });
    },
  });

  return (
    <>
      <div className="post-hdr">
        <div className="post-hdr-top">
          <div className="page-header-left">
            <div className="breadcrumb">
              <span className="bc-link" onClick={() => navigate("feed")}>
                Лента
              </span>
              <span className="bc-sep">/</span>
              {state.postMode === "chat" && state.currentPostChatId != null && activeChat ? (
                <>
                  <span
                    className="bc-link"
                    onClick={() =>
                      dispatch({
                        type: "SET_STATE",
                        patch: {
                          postMode: "chat",
                          currentPostChatId: null,
                          postViewStack: [],
                          isEditing: false,
                        },
                      })
                    }
                  >
                    {truncate(postTitle(post), 32)}
                  </span>
                  <span className="bc-sep">/</span>
                  <span className="crumb-current">{truncate(activeChat.title, 32)}</span>
                </>
              ) : (
                <span className="crumb-current">{truncate(postTitle(post), 38)}</span>
              )}
            </div>
          </div>
          <div className="page-header-right">
            <button
              className="btn btn-ghost btn-sm post-back-btn"
              onClick={handleBack}
              type="button"
            >
              ← Назад
            </button>
            <button
              className={`jump-post-btn${showJump ? " visible" : ""}`}
              onClick={() => chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
              type="button"
            >
              ↑ К посту
            </button>
            <button
              className={`btn btn-ghost btn-sm post-mode-btn${state.postMode === "notes" ? " active" : ""}`}
              onClick={() => toggleMode("notes")}
              type="button"
            >
              Заметки
            </button>
            <button
              className={`btn btn-ghost btn-sm post-mode-btn${state.postMode === "chats" ? " active" : ""}`}
              onClick={() => toggleMode("chats")}
              type="button"
            >
              Чаты
            </button>
            <ContextMenu items={ctxItems} />
          </div>
        </div>
      </div>

      {state.postMode === "chat" ? (
        <>
          <div className="post-body" ref={chatScrollRef}>
            <div className="post-body-inner">
              <PostMessageCard
                ref={postCardRef}
                isEditing={state.isEditing}
                text={post.text}
                media={mediaItems}
                onStartEdit={() => dispatch({ type: "SET_STATE", patch: { isEditing: true } })}
                onCancel={() => dispatch({ type: "SET_STATE", patch: { isEditing: false } })}
                onSave={(t, m) => {
                  dispatch({
                    type: "UPDATE_POST",
                    postId: post.id,
                    patch: { text: t, media: m.length > 0 ? [...m] : undefined },
                  });
                  dispatch({ type: "SET_STATE", patch: { isEditing: false } });
                }}
                badge={badgeForPost(post)}
                metrics={post.status === "published" && post.metrics ? post.metrics : null}
              />
              {history.map((m, i) => (
                <ChatMessage
                  key={i}
                  message={m}
                  ctx={{ scope: "post", entityId: activeChat?.id ?? 0, index: i }}
                />
              ))}
            </div>
          </div>
          <Composer scope="post" onSubmit={sendPost} />
        </>
      ) : state.postMode === "chats" ? (
        <PostChats onOpenChat={openLocalChat} onNewChat={startNewChat} />
      ) : (
        <PostNotes />
      )}
    </>
  );
}

function badgeForPost(post: ReturnType<typeof postById> | null) {
  if (!post) return null;
  if (post.status === "published") return <span className="status-badge badge-pub">● Опубликован</span>;
  if (post.status === "scheduled")
    return (
      <span className="status-badge badge-sch">
        ◷ Отложено · {post.date}
      </span>
    );
  return <span className="status-badge badge-dft">✏ Черновик</span>;
}

const PostMessageCard = ({
  ref,
  isEditing,
  text,
  media,
  onStartEdit,
  onCancel,
  onSave,
  badge,
  metrics,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  text: string;
  media: PostMedia[];
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (t: string, media: PostMedia[]) => void;
  badge: React.ReactNode;
  metrics: PostMetrics | null;
}) => {
  const [draft, setDraft] = useState(text);
  const [mediaDraft, setMediaDraft] = useState<PostMedia[]>(media);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(text);
    setMediaDraft(media);
  }, [text, media, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const id = window.setTimeout(() => {
      const ta = taRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
    return () => window.clearTimeout(id);
  }, [isEditing, ref]);

  useLayoutEffect(() => {
    if (!isEditing) return;
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [isEditing, draft]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const m = await readFileAsMedia(file);
        setMediaDraft((arr) => [...arr, m]);
      } catch {
        /* ignore read errors in demo */
      }
    }
    e.target.value = "";
  }

  return (
    <div className="post-msg-card" id="post-msg-card" ref={ref}>
      <div className="post-msg-label">Вы</div>
      {isEditing ? (
        <>
          {mediaDraft.length > 0 ? (
            <div className="post-msg-media-edit">
              <PostMediaBlock
                media={mediaDraft}
                onRemove={(i) => setMediaDraft((arr) => arr.filter((_, j) => j !== i))}
              />
            </div>
          ) : null}
          <textarea
            ref={taRef}
            className="post-msg-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            accept="image/*,video/*"
            onChange={onPickFile}
          />
          <div className="post-edit-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              🖼 Добавить медиа
            </button>
            <div className="post-edit-actions-right">
              <button className="btn btn-ghost btn-sm" onClick={onCancel} type="button">
                Отмена
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onSave(draft, mediaDraft)}
                type="button"
              >
                Сохранить
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {media.length > 0 ? (
            <div className="post-msg-media">
              <PostMediaBlock media={media} />
            </div>
          ) : null}
          <div className="post-msg-text">
            {text || <span style={{ color: "var(--text3)" }}>Пост пустой — начни писать...</span>}
          </div>
          {metrics ? <PostReactionPills reactions={metrics.reactions} /> : null}
          <div className="post-status-row">
            {badge}
            <div className="post-status-row-right">
              {metrics ? <PostViewsReposts views={metrics.views} reposts={metrics.reposts} /> : null}
              <button className="edit-trigger-btn" onClick={onStartEdit} type="button">
                ✏ Редактировать
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function PostNotes() {
  const { state, dispatch, navigateWithState } = useApp();
  const post = postById(state, state.currentPostId);
  if (!post) return null;

  const addNote = () => {
    const title = prompt("Название заметки:");
    if (!title) return;
    const note: LocalNote = { id: Date.now(), title, date: "сейчас", ai: false, body: "" };
    dispatch({ type: "ADD_POST_NOTE", postId: post.id, note });
  };

  const openNote = (n: LocalNote) => {
    const files: NoteFile[] = Array.isArray(n.files) ? n.files : [];
    navigateWithState({
      screen: "note",
      currentNote: { ...n, isGlobal: false, postId: post.id, files },
      noteFrom: "post",
      noteMode: "view",
      noteSavedSnapshot: JSON.stringify({ title: n.title, body: n.body, ai: n.ai, files }),
    });
  };

  return (
    <div id="post-notes" className="notes-grid visible">
      <div className="notes-grid-inner">
        {post.notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>Нет заметок для этого поста</p>
          </div>
        ) : null}
        {post.notes.map((n) => (
          <div key={n.id} className="note-card" onClick={() => openNote(n)}>
            <div className="note-card-body">
              <div className="note-card-title">{n.title}</div>
              <div className="note-card-preview-post">{n.body || "Пустая заметка"}</div>
            </div>
            <div className="note-card-footer">
              <span className="note-date">{n.date}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  className={`note-ai-toggle${n.ai ? " on" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: post.id, noteId: n.id });
                  }}
                  type="button"
                >
                  {n.ai ? "● ИИ" : "○ ИИ"}
                </button>
                <span
                  className="note-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!confirm("Удалить заметку?")) return;
                    dispatch({ type: "DELETE_POST_NOTE", postId: post.id, noteId: n.id });
                  }}
                >
                  🗑
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="note-card new-note" onClick={addNote}>
          <span style={{ fontSize: 22 }}>＋</span>
          <span style={{ fontSize: 12 }}>Новая заметка</span>
        </div>
      </div>
    </div>
  );
}

function PostChats({
  onOpenChat,
  onNewChat,
}: {
  onOpenChat: (chatId: number) => void;
  onNewChat: () => void;
}) {
  const { state, dispatch } = useApp();
  const post = postById(state, state.currentPostId);
  if (!post) return null;

  return (
    <div id="post-chats" className="post-chats visible">
      <div className="post-chats-inner">
        <div className="post-chats-actions">
          <button className="btn btn-primary btn-sm" onClick={onNewChat} type="button">
            + Новый чат
          </button>
        </div>
        {post.chats.length === 0 ? (
          <div className="empty">
            <div className="eico">💬</div>
            <p>Пока нет локальных чатов</p>
          </div>
        ) : (
          post.chats.map((c) => (
            <div key={c.id} className="chat-card" onClick={() => onOpenChat(c.id)}>
              <div className="chat-card-icon">💬</div>
              <div className="chat-card-body">
                <div className="chat-card-title">{c.title || "Без названия"}</div>
                <div className="chat-card-preview">
                  &quot;{truncate(c.preview || "", 55)}&quot;
                </div>
              </div>
              <div className="chat-card-right">
                <div className="chat-card-date">{c.date}</div>
                <button
                  className="chat-del-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!confirm("Удалить чат?")) return;
                    dispatch({ type: "DELETE_LOCAL_CHAT", postId: post.id, chatId: c.id });
                  }}
                  type="button"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
