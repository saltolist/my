"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp, postById } from "@/state/AppContext";
import { getPostMediaItems, postTitle, truncate } from "@/lib/helpers";
import type { ComposerAttachment, Post } from "@/lib/types";

export type AttachScope = "home" | "gchat" | "post" | "feed";

type Props = {
  scope: AttachScope;
  onAttach: (att: ComposerAttachment) => void;
  placement?: "up" | "down";
};

type Pos =
  | { mode: "up"; bottom: number; left: number }
  | { mode: "down"; top: number; left: number };

type SubmenuKey = "posts" | "pinnedMedia" | null;

let attachIdCounter = 0;
function nextAttachId(): string {
  attachIdCounter += 1;
  return `att-${Date.now()}-${attachIdCounter}`;
}

export default function AttachMenu({ scope, onAttach, placement = "up" }: Props) {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<SubmenuKey>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    if (placement === "down") {
      setPos({ mode: "down", top: r.bottom + 6, left: r.left });
    } else {
      setPos({ mode: "up", bottom: window.innerHeight - r.top + 6, left: r.left });
    }
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
      setSubmenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSubmenu(null);
      }
    }
    function onScroll() {
      updatePos();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onAttach({ id: nextAttachId(), kind: "file", name: file.name, file });
      setOpen(false);
      setSubmenu(null);
    }
    e.target.value = "";
  }

  function onTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (scope === "feed") {
      pickFile();
      return;
    }
    setOpen((v) => !v);
    setSubmenu(null);
  }

  function close() {
    setOpen(false);
    setSubmenu(null);
  }

  const currentPost = scope === "post" ? postById(state, state.currentPostId) : null;
  const postMedia = currentPost ? getPostMediaItems(currentPost).map((m) => m.name) : [];
  const pinnedMedia = collectPinnedMedia(state.posts, state.pinnedPostIds);
  const feedPosts = state.posts;

  const dropdownContent =
    open && scope !== "feed" && pos ? (
      <div
        ref={dropdownRef}
        className="ctx-dropdown attach-dropdown open"
        style={
          pos.mode === "down"
            ? { top: pos.top, left: pos.left }
            : { bottom: pos.bottom, left: pos.left }
        }
      >
        {scope === "post" ? (
          <PostScopeMenu
            submenu={submenu}
            setSubmenu={setSubmenu}
            posts={feedPosts.filter((p) => p.id !== currentPost?.id)}
            media={postMedia}
            onPickPost={(p) => {
              onAttach({ id: nextAttachId(), kind: "post", postId: p.id, title: postTitle(p) });
              close();
            }}
            onPickMedia={(label) => {
              if (currentPost) {
                onAttach({
                  id: nextAttachId(),
                  kind: "media",
                  postId: currentPost.id,
                  postTitle: postTitle(currentPost),
                  media: label,
                });
              }
              close();
            }}
            onPickFile={() => {
              pickFile();
            }}
          />
        ) : (
          <HomeScopeMenu
            submenu={submenu}
            setSubmenu={setSubmenu}
            posts={feedPosts}
            pinnedMedia={pinnedMedia}
            onPickPost={(p) => {
              onAttach({ id: nextAttachId(), kind: "post", postId: p.id, title: postTitle(p) });
              close();
            }}
            onPickPinnedMedia={(item) => {
              onAttach({
                id: nextAttachId(),
                kind: "media",
                postId: item.postId,
                postTitle: item.postTitle,
                media: item.media,
              });
              close();
            }}
            onPickFile={pickFile}
          />
        )}
      </div>
    ) : null;

  return (
    <div className="ctx-wrap attach-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        className="icon-btn attach-btn"
        title="Добавить"
        type="button"
        onClick={onTriggerClick}
        aria-label="Добавить"
      >
        <svg
          className="attach-btn-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFilePicked}
      />
      {dropdownContent && typeof document !== "undefined"
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}

function HomeScopeMenu({
  submenu,
  setSubmenu,
  posts,
  pinnedMedia,
  onPickPost,
  onPickPinnedMedia,
  onPickFile,
}: {
  submenu: SubmenuKey;
  setSubmenu: (k: SubmenuKey) => void;
  posts: Post[];
  pinnedMedia: PinnedMediaItem[];
  onPickPost: (p: Post) => void;
  onPickPinnedMedia: (item: PinnedMediaItem) => void;
  onPickFile: () => void;
}) {
  const hasPinnedMedia = pinnedMedia.length > 0;
  return (
    <>
      <div
        className={`ctx-item attach-parent${submenu === "posts" ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setSubmenu(submenu === "posts" ? null : "posts");
        }}
      >
        <span className="attach-item-label">
          <span className="attach-item-icon">📝</span>
          Прикрепить пост
        </span>
        <span className="attach-chevron">›</span>
        {submenu === "posts" ? (
          <div
            className="ctx-dropdown attach-submenu open"
            onClick={(e) => e.stopPropagation()}
          >
            {posts.length > 0 ? (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="ctx-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickPost(p);
                  }}
                >
                  <span className="attach-item-icon">{statusIcon(p)}</span>
                  {truncate(postTitle(p), 32)}
                </div>
              ))
            ) : (
              <div className="ctx-item disabled">В ленте нет постов</div>
            )}
          </div>
        ) : null}
      </div>

      <div className="ctx-item" onClick={onPickFile}>
        <span className="attach-item-label">
          <span className="attach-item-icon">📎</span>
          Прикрепить файл
        </span>
      </div>

      {hasPinnedMedia ? (
        <div
          className={`ctx-item attach-parent${submenu === "pinnedMedia" ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSubmenu(submenu === "pinnedMedia" ? null : "pinnedMedia");
          }}
        >
          <span className="attach-item-label">
            <span className="attach-item-icon">🖼</span>
            Медиа из закреплённых постов
          </span>
          <span className="attach-chevron">›</span>
          {submenu === "pinnedMedia" ? (
            <div
              className="ctx-dropdown attach-submenu open"
              onClick={(e) => e.stopPropagation()}
            >
              {pinnedMedia.map((item, i) => (
                <div
                  key={i}
                  className="ctx-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickPinnedMedia(item);
                  }}
                >
                  <span className="attach-item-icon">🖼</span>
                  <span className="attach-pinned-label">
                    <b>{truncate(item.postTitle, 18)}</b>: {truncate(String(item.media), 24)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function PostScopeMenu({
  submenu,
  setSubmenu,
  posts,
  media,
  onPickPost,
  onPickMedia,
  onPickFile,
}: {
  submenu: SubmenuKey;
  setSubmenu: (k: SubmenuKey) => void;
  posts: Post[];
  media: string[];
  onPickPost: (p: Post) => void;
  onPickMedia: (label: string) => void;
  onPickFile: () => void;
}) {
  return (
    <>
      <div
        className={`ctx-item attach-parent${submenu === "posts" ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setSubmenu(submenu === "posts" ? null : "posts");
        }}
      >
        <span className="attach-item-label">
          <span className="attach-item-icon">📝</span>
          Прикрепить пост
        </span>
        <span className="attach-chevron">›</span>
        {submenu === "posts" ? (
          <div
            className="ctx-dropdown attach-submenu open"
            onClick={(e) => e.stopPropagation()}
          >
            {posts.length > 0 ? (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="ctx-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickPost(p);
                  }}
                >
                  <span className="attach-item-icon">{statusIcon(p)}</span>
                  {truncate(postTitle(p), 32)}
                </div>
              ))
            ) : (
              <div className="ctx-item disabled">В ленте нет других постов</div>
            )}
          </div>
        ) : null}
      </div>

      {media.length > 0 ? (
        media.map((m, i) => (
          <div
            key={i}
            className="ctx-item"
            onClick={(e) => {
              e.stopPropagation();
              onPickMedia(m);
            }}
          >
            <span className="attach-item-icon">🖼</span>
            Медиа из поста: {truncate(String(m), 28)}
          </div>
        ))
      ) : (
        <div className="ctx-item disabled">🖼 В посте нет медиа</div>
      )}
      <div className="ctx-item" onClick={onPickFile}>
        <span className="attach-item-icon">📎</span>
        Загрузить с компьютера
      </div>
    </>
  );
}

function statusIcon(p: Post): string {
  if (p.status === "published") return "📢";
  if (p.status === "scheduled") return "🕐";
  return "📝";
}

type PinnedMediaItem = { postId: number; media: string; postTitle: string };

function collectPinnedMedia(posts: Post[], pinned: number[]): PinnedMediaItem[] {
  return posts
    .filter((p) => pinned.includes(p.id))
    .flatMap((p) =>
      (p.media ?? []).map((m) => ({ postId: p.id, media: m.name, postTitle: postTitle(p) })),
    );
}
