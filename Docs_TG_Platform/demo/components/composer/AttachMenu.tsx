"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanelScrollListeners } from "@/lib/hooks/useFloatingPanelScrollListeners";
import { useOverlayDismissOnPointer } from "@/lib/hooks/useOverlayDismissOnPointer";
import { NoteIconAttach, NoteIconImage } from "@/components/note/NoteHeaderIcons";
import { useApp, postById } from "@/state/AppContext";
import { getPostMediaItems, isImageMedia, isVideoMedia, postTitle } from "@/lib/helpers";
import type { ComposerAttachment, Post, PostMedia } from "@/lib/types";

function AttachMenuIconAttach() {
  return (
    <span className="attach-item-icon" aria-hidden>
      <NoteIconAttach size={18} />
    </span>
  );
}

function AttachMenuIconImage() {
  return (
    <span className="attach-item-icon" aria-hidden>
      <NoteIconImage size={18} />
    </span>
  );
}

export type AttachScope = "home" | "gchat" | "post" | "feed";

type Props = {
  scope: AttachScope;
  onAttach: (att: ComposerAttachment) => void;
  placement?: "up" | "down";
  attachments?: ComposerAttachment[];
};

type Pos =
  | { mode: "up"; bottom: number; left: number }
  | { mode: "down"; top: number; left: number };

type SubmenuKey = "pinnedMedia" | "postMedia" | null;

let attachIdCounter = 0;
function nextAttachId(): string {
  attachIdCounter += 1;
  return `att-${Date.now()}-${attachIdCounter}`;
}

export default function AttachMenu({
  scope,
  onAttach,
  placement = "up",
  attachments = [],
}: Props) {
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

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSubmenu(null);
  }, []);

  const { consumeSuppressTriggerClick } = useOverlayDismissOnPointer({
    open,
    onClose: closeMenu,
    contentRef: dropdownRef,
    triggerRef: btnRef,
  });

  useFloatingPanelScrollListeners({
    open,
    onReflow: updatePos,
    onClose: closeMenu,
  });

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
    if (consumeSuppressTriggerClick()) return;
    if (scope === "feed") {
      pickFile();
      return;
    }
    setOpen((v) => !v);
    setSubmenu(null);
  }

  function close() {
    closeMenu();
  }

  const currentPost = scope === "post" ? postById(state, state.currentPostId) : null;
  const postMedia: PostMedia[] = currentPost ? getPostMediaItems(currentPost) : [];
  const attachedPostIds = attachments
    .filter((a): a is Extract<ComposerAttachment, { kind: "post" }> => a.kind === "post")
    .map((a) => a.postId);
  const attachedPostsMedia = collectAttachedMedia(state.posts, attachedPostIds);

  const dropdownContent =
    open && scope !== "feed" && pos ? (
      <div
        ref={dropdownRef}
        className={`ctx-dropdown attach-dropdown open attach-dropdown-${pos.mode}`}
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
            media={postMedia}
            postTitleText={currentPost ? postTitle(currentPost) : ""}
            attachedMedia={attachedPostsMedia}
            hasAttachedPosts={attachedPostIds.length > 0}
            onPickMedia={(media) => {
              if (currentPost) {
                onAttach({
                  id: nextAttachId(),
                  kind: "media",
                  postId: currentPost.id,
                  postTitle: postTitle(currentPost),
                  media: media.name,
                });
              }
              close();
            }}
            onPickAttachedMedia={(item) => {
              onAttach({
                id: nextAttachId(),
                kind: "media",
                postId: item.postId,
                postTitle: item.postTitle,
                media: item.media.name,
              });
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
            attachedMedia={attachedPostsMedia}
            hasAttachedPosts={attachedPostIds.length > 0}
            onPickAttachedMedia={(item) => {
              onAttach({
                id: nextAttachId(),
                kind: "media",
                postId: item.postId,
                postTitle: item.postTitle,
                media: item.media.name,
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
  attachedMedia,
  hasAttachedPosts,
  onPickAttachedMedia,
  onPickFile,
}: {
  submenu: SubmenuKey;
  setSubmenu: (k: SubmenuKey) => void;
  attachedMedia: AttachedMediaItem[];
  hasAttachedPosts: boolean;
  onPickAttachedMedia: (item: AttachedMediaItem) => void;
  onPickFile: () => void;
}) {
  const hasAttachedMedia = attachedMedia.length > 0;
  return (
    <>
      <div className="ctx-item" onClick={onPickFile}>
        <span className="attach-item-label">
          <AttachMenuIconAttach />
          Прикрепить файл
        </span>
      </div>

      {hasAttachedPosts ? (
        <div
          className={`ctx-item attach-parent${submenu === "pinnedMedia" ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSubmenu(submenu === "pinnedMedia" ? null : "pinnedMedia");
          }}
        >
          <span className="attach-item-label">
            <AttachMenuIconImage />
            Медиа из прикреплённых постов
          </span>
          <span className="attach-chevron">›</span>
          {submenu === "pinnedMedia" ? (
            <div
              className="ctx-dropdown attach-submenu attach-media-submenu open"
              onClick={(e) => e.stopPropagation()}
            >
              {hasAttachedMedia ? (
                <MediaGrid
                  items={attachedMedia.map((item) => ({
                    media: item.media,
                    title: `${item.postTitle}: ${item.media.name}`,
                    onPick: () => onPickAttachedMedia(item),
                  }))}
                />
              ) : (
                <div className="ctx-item disabled">У прикреплённых постов нет медиа</div>
              )}
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
  media,
  postTitleText,
  attachedMedia,
  hasAttachedPosts,
  onPickMedia,
  onPickAttachedMedia,
  onPickFile,
}: {
  submenu: SubmenuKey;
  setSubmenu: (k: SubmenuKey) => void;
  media: PostMedia[];
  postTitleText: string;
  attachedMedia: AttachedMediaItem[];
  hasAttachedPosts: boolean;
  onPickMedia: (media: PostMedia) => void;
  onPickAttachedMedia: (item: AttachedMediaItem) => void;
  onPickFile: () => void;
}) {
  const hasMedia = media.length > 0;
  const hasAttachedMedia = attachedMedia.length > 0;
  return (
    <>
      {hasMedia ? (
        <div
          className={`ctx-item attach-parent${submenu === "postMedia" ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSubmenu(submenu === "postMedia" ? null : "postMedia");
          }}
        >
          <span className="attach-item-label">
            <AttachMenuIconImage />
            Медиа из поста
          </span>
          <span className="attach-chevron">›</span>
          {submenu === "postMedia" ? (
            <div
              className="ctx-dropdown attach-submenu attach-media-submenu open"
              onClick={(e) => e.stopPropagation()}
            >
              <MediaGrid
                items={media.map((m) => ({
                  media: m,
                  title: `${postTitleText}: ${m.name}`,
                  onPick: () => onPickMedia(m),
                }))}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="ctx-item disabled">
          <span className="attach-item-label">
            <AttachMenuIconImage />
            В посте нет медиа
          </span>
        </div>
      )}
      {hasAttachedPosts ? (
        <div
          className={`ctx-item attach-parent${submenu === "pinnedMedia" ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSubmenu(submenu === "pinnedMedia" ? null : "pinnedMedia");
          }}
        >
          <span className="attach-item-label">
            <AttachMenuIconImage />
            Медиа из прикреплённых постов
          </span>
          <span className="attach-chevron">›</span>
          {submenu === "pinnedMedia" ? (
            <div
              className="ctx-dropdown attach-submenu attach-media-submenu open"
              onClick={(e) => e.stopPropagation()}
            >
              {hasAttachedMedia ? (
                <MediaGrid
                  items={attachedMedia.map((item) => ({
                    media: item.media,
                    title: `${item.postTitle}: ${item.media.name}`,
                    onPick: () => onPickAttachedMedia(item),
                  }))}
                />
              ) : (
                <div className="ctx-item disabled">У прикреплённых постов нет медиа</div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="ctx-item" onClick={onPickFile}>
        <span className="attach-item-label">
          <AttachMenuIconAttach />
          Загрузить с компьютера
        </span>
      </div>
    </>
  );
}

function MediaGrid({
  items,
}: {
  items: Array<{ media: PostMedia; title: string; onPick: () => void }>;
}) {
  if (items.length === 0) return <div className="ctx-item disabled">Нет медиа</div>;
  const n = items.length;
  const cols = n === 1 ? 1 : n === 2 ? 2 : n === 4 ? 2 : 3;
  return (
    <div
      className="attach-media-grid"
      data-count={n}
      style={{ gridTemplateColumns: `repeat(${cols}, 72px)` }}
    >
      {items.map((it, i) => (
        <button
          key={`${it.media.name}-${i}`}
          type="button"
          className="attach-media-thumb"
          title={it.title}
          onClick={(e) => {
            e.stopPropagation();
            it.onPick();
          }}
        >
          <MediaThumbInner media={it.media} />
        </button>
      ))}
    </div>
  );
}

function MediaThumbInner({ media }: { media: PostMedia }) {
  if (isImageMedia(media) && media.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="attach-media-thumb-img" src={media.url} alt={media.name} />;
  }
  if (isVideoMedia(media) && media.url) {
    return <video className="attach-media-thumb-img" src={media.url} muted playsInline preload="metadata" />;
  }
  return (
    <span className="attach-media-thumb-doc" aria-hidden="true">
      <NoteIconAttach size={22} />
    </span>
  );
}

type AttachedMediaItem = { postId: number; media: PostMedia; postTitle: string };

function collectAttachedMedia(posts: Post[], attachedIds: number[]): AttachedMediaItem[] {
  return posts
    .filter((p) => attachedIds.includes(p.id))
    .flatMap((p) =>
      (p.media ?? []).map((m) => ({ postId: p.id, media: m, postTitle: postTitle(p) })),
    );
}
