"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { postById, useApp } from "@/state/AppContext";
import {
  postTitle,
  readFileAsMedia,
  truncate,
  chatListUserLine,
  chatListAssistantLine,
} from "@/lib/helpers";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import Composer from "../composer/Composer";
import ChatMessage from "../chat/ChatMessage";
import ChatListCardMenu from "../chat/ChatListCardMenu";
import NoteCardAiToggle from "../note/NoteCardAiToggle";
import NoteListCardMenu from "../note/NoteListCardMenu";
import { NoteIconAttach } from "../note/NoteHeaderIcons";
import PostMediaBlock from "../post/PostMediaBlock";
import { PostReactionPills, PostViewsReposts } from "../feed/PostEngagement";
import PageHeaderSearchInput, {
  PageHeaderSearchMagnifier,
} from "../PageHeaderSearchInput";
import PageHeaderMenuButton from "../PageHeaderMenuButton";
import PageHeaderOverflow, {
  type PageHeaderOverflowItem,
} from "../PageHeaderOverflow";
import PostStatus from "../feed/PostStatus";
import PostCardToolbar from "../post/PostCardToolbar";
import PostCommentsPanel from "../post/PostCommentsPanel";
import PostCommentsRow from "../post/PostCommentsRow";
import { ContextMenu } from "../ContextMenu";
import { usePostCtxMenuItems } from "../post/postCtxMenu";
import { NavIconChats, NavIconFeed, NavIconNotes } from "@/components/sidebar/NavIcons";
import { useFeedPostLayout } from "@/lib/hooks/useFeedPostLayout";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { routes } from "@/lib/routes";
import type { LocalNote, NoteFile, PostComment, PostMedia, PostMetrics, PostMode } from "@/lib/types";

const POST_BREADCRUMB_LABEL = "Пост";

export default function PostScreen() {
  const {
    state,
    dispatch,
    navigate,
    navigateBack,
    setPostView,
    goToHref,
    canLeaveCurrentScreen,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    sendPost,
  } = useApp();
  const post = postById(state, state.currentPostId);
  const isMobile = useMobile760();
  const { phoneFormat, layoutClassName, layoutStyle } = useFeedPostLayout();
  const { items: ctxItems, modal: ctxModal } = usePostCtxMenuItems(post);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);
  const mediaItems: PostMedia[] = post?.media ?? [];
  const activeChat = post?.chats.find((c) => c.id === state.currentPostChatId) || null;
  const chatHistory = activeChat?.history;
  const flatMessages = useMemo(() => flattenVisibleWithPaths(chatHistory ?? []), [chatHistory]);
  const lastAssistantFlat = useMemo(() => lastAssistantFlatIndex(flatMessages), [flatMessages]);

  useEffect(() => {
    if (state.postMode === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [flatMessages.length, state.postMode]);

  useEffect(() => {
    if (state.postMode !== "chat") {
      setShowJump(false);
      return;
    }
    const sync = () => {
      if (!chatScrollRef.current || !postCardRef.current) return;
      const hdr = chatScrollRef.current
        .closest(".screen")
        ?.querySelector<HTMLElement>(".post-hdr");
      const revealLine = hdr?.getBoundingClientRect().bottom ?? chatScrollRef.current.getBoundingClientRect().top;
      const cr = postCardRef.current.getBoundingClientRect();
      setShowJump(cr.bottom < revealLine + 4);
    };
    sync();
    const el = chatScrollRef.current;
    el?.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [state.postMode, state.isEditing, post?.id, activeChat?.id]);

  const applyPostView = (nextMode: PostMode, nextChatId: number | null = null) => {
    if (!post) return;
    setPostView(nextMode, nextChatId);
    setListSearch("");
  };
  const goToPostNotes = () => applyPostView("notes", null);
  const goToPostChats = () => applyPostView("chats", null);
  const openPostView = () => applyPostView("chat", state.currentPostChatId);
  const openLocalChat = (chatId: number) => applyPostView("chat", chatId);
  const startNewChat = () => applyPostView("chat", null);
  const startNewNote = () => {
    if (!post) return;
    goToHref(routes.noteNew("post", post.id));
  };
  const handleBack = () => {
    navigateBack("feed");
  };

  const postSubPage =
    state.postMode === "comments"
      ? "Комментарии"
      : state.postMode === "notes"
        ? "Заметки"
        : state.postMode === "chats"
          ? "Чаты"
          : null;
  const showListHeaderSearch = postSubPage != null;

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [state.postMode, showListHeaderSearch]);

  const postHeaderOverflowItems = useMemo((): PageHeaderOverflowItem[] => {
    if (!post) return [];
    const items: PageHeaderOverflowItem[] = [];

    if (state.postMode !== "chat") {
      items.push({
        label: "К посту",
        onClick: openPostView,
        icon: <NavIconFeed />,
      });
    }

    items.push({
      label: "Заметки",
      onClick: goToPostNotes,
      active: state.postMode === "notes",
      icon: <NavIconNotes />,
    });
    items.push({
      label: "Чаты",
      onClick: goToPostChats,
      active: state.postMode === "chats",
      icon: <NavIconChats />,
    });

    if (state.postMode === "chat" && showJump) {
      items.push({
        label: "↑ К посту",
        onClick: () => chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
      });
    }

    return [
      ...items,
      ...ctxItems.map((item) => ({
        label: item.label,
        onClick: item.onClick,
        icon: item.icon,
        danger: item.danger,
        disabled: item.disabled,
      })),
    ];
  }, [
    ctxItems,
    goToPostChats,
    goToPostNotes,
    openPostView,
    post,
    showJump,
    state.postMode,
  ]);

  if (!post) {
    return (
      <div className="post-hdr">
        <div className="post-hdr-top">
          <div className="page-header-left">
            <PageHeaderMenuButton />
            <button
              className="btn btn-ghost btn-sm page-header-back-btn"
              onClick={() => navigateBack("feed")}
              type="button"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const listSearchPlaceholder =
    state.postMode === "comments"
      ? "Поиск по комментариям..."
      : state.postMode === "notes"
        ? "Поиск по заметкам..."
        : "Поиск по чатам...";
  const postIntermediateCrumb = isMobile
    ? POST_BREADCRUMB_LABEL
    : truncate(postTitle(post), 32);

  return (
    <div className={`post-screen-wrap${layoutClassName}`} style={layoutStyle}>
      <div
        className={`post-hdr${
          showListHeaderSearch
            ? isMobile
              ? ` post-hdr--with-search-mobile${mobileSearchOpen ? " post-hdr--search-open" : ""}`
              : " post-hdr--with-search"
            : ""
        }`}
      >
        <div className="post-hdr-top">
          <div className="page-header-left">
            <PageHeaderMenuButton />
            {!(isMobile && mobileSearchOpen) ? (
            <div className="breadcrumb">
              <span className="bc-link" onClick={() => navigate("feed")}>
                Лента
              </span>
              <span className="bc-sep">/</span>
              {postSubPage ? (
                <>
                  <span className="bc-link" onClick={openPostView}>
                    {postIntermediateCrumb}
                  </span>
                  <span className="bc-sep">/</span>
                  <span className="crumb-current">{postSubPage}</span>
                </>
              ) : state.postMode === "chat" && state.currentPostChatId != null && activeChat ? (
                <>
                  <span
                    className="bc-link"
                    onClick={() => {
                      if (!confirmDiscardAnyEdit()) return;
                      discardPendingEdits();
                      dispatch({
                        type: "SET_STATE",
                        patch: {
                          postMode: "chat",
                          currentPostChatId: null,
                          postViewStack: [],
                          isEditing: false,
                        },
                      });
                    }}
                  >
                    {postIntermediateCrumb}
                  </span>
                  <span className="bc-sep">/</span>
                  <span className="crumb-current">{truncate(activeChat.title, 32)}</span>
                </>
              ) : (
                <span className="crumb-current">{truncate(postTitle(post), 38)}</span>
              )}
            </div>
            ) : null}
          </div>
          {showListHeaderSearch && isMobile && mobileSearchOpen ? (
            <div className="post-header-search-expand" ref={mobileSearchWrapRef}>
              <PageHeaderSearchInput
                autoFocus
                placeholder={listSearchPlaceholder}
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                aria-label={listSearchPlaceholder}
                inputRef={mobileSearchInputRef}
                onDismiss={() => setMobileSearchOpen(false)}
              />
            </div>
          ) : null}
          {showListHeaderSearch && !isMobile ? (
            <div className="page-header-center">
              <div className="post-header-search-row">
                <PageHeaderSearchInput
                  placeholder={listSearchPlaceholder}
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  onDismiss={() => setListSearch("")}
                />
                {state.postMode === "notes" ? (
                  <button
                    className="post-new-note-btn page-header-toolbar--desktop"
                    onClick={startNewNote}
                    type="button"
                  >
                    + Новая заметка
                  </button>
                ) : null}
                {state.postMode === "chats" ? (
                  <button
                    className="post-new-chat-btn page-header-toolbar--desktop"
                    onClick={startNewChat}
                    type="button"
                  >
                    + Новый чат
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          <div
            className={`page-header-right${showJump ? " post-hdr-has-reveal" : ""}`}
          >
            {!isMobile ? (
              <div className="page-header-actions--desktop">
                <button
                  className={`jump-post-btn${showJump ? " visible" : ""}`}
                  onClick={() => chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  type="button"
                >
                  ↑ К посту
                </button>
                <div className="post-mode-cluster">
                  <button
                    className={`btn btn-ghost btn-sm post-mode-btn${state.postMode === "notes" ? " active" : ""}`}
                    onClick={goToPostNotes}
                    type="button"
                  >
                    Заметки
                  </button>
                </div>
                <div className="post-mode-cluster">
                  <button
                    className={`btn btn-ghost btn-sm post-mode-btn${state.postMode === "chats" ? " active" : ""}`}
                    onClick={goToPostChats}
                    type="button"
                  >
                    Чаты
                  </button>
                </div>
                <button
                  className="btn btn-ghost btn-sm post-back-btn"
                  onClick={handleBack}
                  type="button"
                >
                  ← Назад
                </button>
                <ContextMenu
                  items={ctxItems}
                  portal
                  align="right"
                  dropdownClassName="ctx-dropdown--page-header-control"
                />
              </div>
            ) : null}
            {isMobile &&
            ((showListHeaderSearch && !mobileSearchOpen) || postHeaderOverflowItems.length > 0) ? (
              <div className="page-header-mobile-cluster">
                {showListHeaderSearch && !mobileSearchOpen ? (
                  <button
                    type="button"
                    className={`post-header-search-toggle${mobileSearchOpen ? " is-active" : ""}`}
                    aria-label={listSearchPlaceholder}
                    aria-expanded={mobileSearchOpen}
                    onClick={() => setMobileSearchOpen((open) => !open)}
                  >
                    <PageHeaderSearchMagnifier size={18} />
                  </button>
                ) : null}
                {postHeaderOverflowItems.length > 0 ? (
                  <PageHeaderOverflow
                    className="page-header-actions--mobile"
                    items={postHeaderOverflowItems}
                  />
                ) : null}
              </div>
            ) : null}
            {ctxModal}
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
                comments={post.status === "published" ? (post.comments ?? []) : undefined}
                onOpenComments={() => applyPostView("comments", null)}
                isTextOnlyNoMedia={
                  mediaItems.length === 0 &&
                  (post.status === "published" || post.status === "scheduled" || post.status === "draft")
                }
                phoneFormat={phoneFormat}
              />
              {flatMessages.map(({ message: m, path }, i) => (
                <ChatMessage
                  key={path.join("-")}
                  message={m}
                  ctx={{
                    scope: "post",
                    postId: post.id,
                    entityId: activeChat?.id ?? 0,
                    path,
                  }}
                  isLastAssistantMessage={m.role === "ai" && i === lastAssistantFlat}
                />
              ))}
            </div>
          </div>
          <Composer scope="post" onSubmit={sendPost} />
        </>
      ) : state.postMode === "chats" ? (
        <div className="post-subpage-scroll">
          <div className="post-subpage-toolbar">
            <button className="post-new-chat-btn" onClick={startNewChat} type="button">
              + Новый чат
            </button>
          </div>
          <PostChats search={listSearch} onOpenChat={openLocalChat} />
        </div>
      ) : state.postMode === "comments" ? (
        <PostCommentsPanel
          post={post}
          search={listSearch}
          postCardRef={postCardRef}
          badge={badgeForPost(post)}
          metrics={post.status === "published" && post.metrics ? post.metrics : null}
          media={mediaItems}
          phoneFormat={phoneFormat}
        />
      ) : (
        <div className="post-subpage-scroll">
          <div className="post-subpage-toolbar">
            <button className="post-new-note-btn" onClick={startNewNote} type="button">
              + Новая заметка
            </button>
          </div>
          <PostNotes search={listSearch} />
        </div>
      )}
    </div>
  );
}

function badgeForPost(post: ReturnType<typeof postById> | null) {
  if (!post) return null;
  return <PostStatus post={post} />;
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
  comments,
  onOpenComments,
  isTextOnlyNoMedia,
  phoneFormat,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  text: string;
  media: PostMedia[];
  isTextOnlyNoMedia?: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (t: string, media: PostMedia[]) => void;
  badge: React.ReactNode;
  metrics: PostMetrics | null;
  comments?: PostComment[];
  onOpenComments?: () => void;
  phoneFormat?: boolean;
}) => {
  const showComments = !!metrics;
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

  const copyText = text.trim() || "";

  return (
    <div
      className={`post-msg-block${phoneFormat ? " post-format-phone" : ""}`}
      id="post-msg-card"
    >
    <div
      ref={ref}
      className={[
        "post-msg-card",
        showComments ? "post-msg-card--with-comments" : "",
        isTextOnlyNoMedia ? "post-card--no-media" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="post-card-body">
        {isEditing ? (
          mediaDraft.length > 0 ? (
            <div className="post-msg-media-edit">
              <PostMediaBlock
                media={mediaDraft}
                onRemove={(i) => setMediaDraft((arr) => arr.filter((_, j) => j !== i))}
              />
            </div>
          ) : null
        ) : media.length > 0 ? (
          <div className="post-card-media">
            <PostMediaBlock media={media} />
          </div>
        ) : null}
        {isEditing ? (
          <textarea
            ref={taRef}
            className={[
              "post-card-text",
              "post-msg-textarea",
              !draft.trim() ? "empty" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Пост пустой — начни писать..."
            rows={1}
            spellCheck={false}
            aria-label="Текст поста"
          />
        ) : text ? (
          <div className="post-card-text">{text}</div>
        ) : (
          <div className="post-card-text empty">Пост пустой — начни писать...</div>
        )}
        {metrics ? <PostReactionPills reactions={metrics.reactions} /> : null}
        <div className="post-card-footer">
          <div className="post-meta">{badge}</div>
          {metrics ? <PostViewsReposts views={metrics.views} reposts={metrics.reposts} /> : null}
        </div>
        {showComments ? (
          <PostCommentsRow
            count={comments?.length ?? 0}
            onClick={
              !isEditing && onOpenComments
                ? (e) => {
                    e.stopPropagation();
                    onOpenComments();
                  }
                : undefined
            }
          />
        ) : null}
      </div>
    </div>
    {isEditing ? (
      <div className="post-msg-actions" aria-label="Редактирование поста">
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          accept="image/*,video/*"
          onChange={onPickFile}
        />
        <div className="post-edit-toolbar">
          <div className="msg-user-edit-bar">
            <button
              className="note-header-plain-btn note-header-plain-btn--sm note-header-plain-btn--attach"
              onClick={() => fileRef.current?.click()}
              type="button"
              title="Прикрепить файл"
              aria-label="Прикрепить файл"
            >
              <NoteIconAttach />
            </button>
            <button
              className="btn btn-primary post-edit-btn"
              onClick={() => onSave(draft, mediaDraft)}
              type="button"
            >
              Сохранить
            </button>
            <button className="btn btn-ghost post-edit-btn" onClick={onCancel} type="button">
              Отмена
            </button>
          </div>
        </div>
      </div>
    ) : (
      <PostCardToolbar plainText={copyText} onEdit={onStartEdit} />
    )}
    </div>
  );
};

function PostNotes({ search }: { search: string }) {
  const { state, dispatch, goToHref } = useApp();
  const post = postById(state, state.currentPostId);
  if (!post) return null;

  const q = search.trim().toLowerCase();
  const notes = post.notes.filter(
    (n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
  );

  const openNote = (n: LocalNote) => {
    goToHref(routes.notePost(post.id, n.id));
  };

  return (
    <div id="post-notes" className="notes-grid visible">
      <div className="notes-grid-inner">
        {post.notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>Нет заметок для этого поста</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty">
            <div className="eico">📝</div>
            <p>Ничего не найдено</p>
          </div>
        ) : null}
        {notes.map((n) => (
          <div key={n.id} className="note-card" onClick={() => openNote(n)}>
            <div className="note-card-body">
              <div className="note-card-page-head">
                <div className="note-card-title">{n.title}</div>
                <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                  <NoteListCardMenu isGlobal={false} postId={post.id} noteId={n.id} title={n.title} />
                </div>
              </div>
              <div className="note-card-preview-post">{n.body || "Пустая заметка"}</div>
            </div>
            <div className="note-card-footer">
              <NoteCardAiToggle
                ai={n.ai}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "TOGGLE_POST_NOTE_AI", postId: post.id, noteId: n.id });
                }}
              />
              <span className="note-date">{n.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostChats({ search, onOpenChat }: { search: string; onOpenChat: (chatId: number) => void }) {
  const { state } = useApp();
  const post = postById(state, state.currentPostId);
  if (!post) return null;

  const q = search.trim().toLowerCase();
  const chats = post.chats.filter((c) => {
    if (!q) return true;
    const u = chatListUserLine(c.history, c.title || "Без названия");
    const a = chatListAssistantLine(c.history, c.preview || "");
    return `${u} ${a} ${c.title}`.toLowerCase().includes(q);
  });

  return (
    <div id="post-chats" className="post-chats visible">
      <div className="post-chats-inner">
        {post.chats.length === 0 ? (
          <div className="empty">
            <div className="eico">💬</div>
            <p>Пока нет локальных чатов</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="empty">
            <div className="eico">💬</div>
            <p>Ничего не найдено</p>
          </div>
        ) : (
          chats.map((c) => {
            const userLine = chatListUserLine(c.history, c.title || "Без названия");
            const assistantLine = chatListAssistantLine(c.history, c.preview || "");
            return (
              <div key={c.id} className="chat-card" onClick={() => onOpenChat(c.id)}>
                <div className="chat-card-body-row">
                  <div className="chat-card-main">
                    <div className="chat-card-row1">
                      <div className="chat-card-title">{userLine}</div>
                      <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                        <ChatListCardMenu
                          scope="local"
                          postId={post.id}
                          chatId={c.id}
                          title={c.title || "Без названия"}
                        />
                      </div>
                    </div>
                    <div className="chat-card-row2">
                      <div className="chat-card-preview">{assistantLine || "—"}</div>
                      <div className="chat-card-date">{c.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
