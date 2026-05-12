"use client";

import { useEffect, useRef, useState } from "react";
import { useApp, postById } from "@/state/AppContext";
import { getPostMediaItems, postTitle, truncate } from "@/lib/helpers";
import type { ComposerAttachment, Post } from "@/lib/types";

export type AttachScope = "home" | "gchat" | "post" | "feed";

type Props = {
  scope: AttachScope;
  onAttach: (att: ComposerAttachment) => void;
};

type SubmenuKey = "posts" | "pinnedMedia" | null;

let attachIdCounter = 0;
function nextAttachId(): string {
  attachIdCounter += 1;
  return `att-${Date.now()}-${attachIdCounter}`;
}

export default function AttachMenu({ scope, onAttach }: Props) {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<SubmenuKey>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSubmenu(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSubmenu(null);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onAttach({ id: nextAttachId(), kind: "file", name: file.name });
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
  const postMedia = currentPost ? getPostMediaItems(currentPost) : [];
  const pinnedMedia = collectPinnedMedia(state.posts, state.pinnedPostIds);
  const feedPosts = state.posts;

  return (
    <div className="ctx-wrap attach-wrap" ref={wrapRef}>
      <button
        className="icon-btn attach-btn"
        title="Добавить"
        type="button"
        onClick={onTriggerClick}
        aria-label="Добавить"
      >
        +
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFilePicked}
      />
      {open && scope !== "feed" ? (
        <div className="ctx-dropdown attach-dropdown open">
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
      ) : null}
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
    .flatMap((p) => {
      if (Array.isArray(p.media)) return p.media.map((m) => ({ postId: p.id, media: m, postTitle: postTitle(p) }));
      if (typeof p.media === "string" && p.media.trim()) {
        return [{ postId: p.id, media: p.media.trim(), postTitle: postTitle(p) }];
      }
      return [];
    });
}
