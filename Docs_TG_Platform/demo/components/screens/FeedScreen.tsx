"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/state/AppContext";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import PageHeader from "../PageHeader";
import PageHeaderSearchInput from "../PageHeaderSearchInput";
import PostCard from "../feed/PostCard";
import DraftsSection from "../feed/DraftsSection";
import { buildPublishedFeedDayGroups, sortPostsByPublicationTime } from "@/lib/feedTimeline";
import { autoResize, postTitle, readFileAsMedia } from "@/lib/helpers";
import AttachMenu from "../composer/AttachMenu";
import { onComposerShellMouseDown } from "@/lib/composerPointerDown";
import PostMediaBlock from "../post/PostMediaBlock";
import type { Post, PostMedia } from "@/lib/types";

const FEED_POST_WIDTHS = [500, 390, 270] as const;
type FeedPostWidth = (typeof FEED_POST_WIDTHS)[number];

/** Позиция скролла ленты между визитами (экран остаётся смонтированным). */
let feedScrollTopMemory = 0;
let feedDidInitialScrollToBottom = false;

export default function FeedScreen() {
  const { state, dispatch, openPost, openPostComments } = useApp();
  const pathname = usePathname() ?? "/";
  const onFeed = pathname === "/feed/" || pathname === "/feed";
  const isMobile = useMobile760();
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PostMedia[]>([]);
  const [search, setSearch] = useState("");
  const [feedPostWidth, setFeedPostWidth] = useState<FeedPostWidth>(500);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current, 16);
  }, [draft]);

  const q = search.trim().toLowerCase();
  const matchPost = (p: Post) =>
    !q ||
    postTitle(p).toLowerCase().includes(q) ||
    (p.text || "").toLowerCase().includes(q);
  const published = useMemo(
    () => state.posts.filter((p) => p.status === "published" && matchPost(p)),
    [state.posts, q],
  );
  const publishedDayGroups = useMemo(() => buildPublishedFeedDayGroups(published), [published]);

  useEffect(() => {
    const el = feedScrollRef.current;
    if (!el || !onFeed) return;
    const onScroll = () => {
      feedScrollTopMemory = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onFeed]);

  const applyFeedScroll = (el: HTMLDivElement) => {
    if (!feedDidInitialScrollToBottom) {
      el.scrollTop = el.scrollHeight;
      feedScrollTopMemory = el.scrollTop;
      feedDidInitialScrollToBottom = true;
      return;
    }
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollTop = Math.min(feedScrollTopMemory, max);
  };

  useLayoutEffect(() => {
    const el = feedScrollRef.current;
    if (!el || !onFeed) return;
    applyFeedScroll(el);
    const id = requestAnimationFrame(() => applyFeedScroll(el));
    return () => cancelAnimationFrame(id);
  }, [onFeed]);

  const scheduled = useMemo(
    () => sortPostsByPublicationTime(
      state.posts.filter((p) => p.status === "scheduled" && matchPost(p)),
      "asc",
    ),
    [state.posts, q],
  );
  const drafts = state.posts.filter((p) => p.status === "draft" && matchPost(p));

  function submitDraft() {
    const text = draft.trim();
    if (!text && pendingMedia.length === 0) return;
    const newPost: Post = {
      id: Date.now(),
      status: "draft",
      created: "только что",
      rubric: null,
      text,
      notes: [],
      chats: [],
      ...(pendingMedia.length > 0 ? { media: [...pendingMedia] } : {}),
    };
    dispatch({ type: "UPDATE_POSTS", posts: [...state.posts, newPost] });
    setDraft("");
    setPendingMedia([]);
  }

  function removePendingMedia(index: number) {
    setPendingMedia((arr) => arr.filter((_, i) => i !== index));
  }

  return (
    <div
      className={`feed-screen-wrap${isMobile || feedPostWidth === 270 ? " post-format-phone" : ""}`}
      style={{ "--feed-post-w": `${isMobile ? 270 : feedPostWidth}px` } as CSSProperties}
    >
      <div className="feed-layout screen-header-host">
        <PageHeader
          title="Лента"
          backTo="home"
          search={
            <div className="page-header-feed-search-row">
              <PageHeaderSearchInput
                placeholder="Поиск по постам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onDismiss={() => setSearch("")}
              />
              <div
                className="feed-post-width-toggles page-header-toolbar--desktop"
                role="radiogroup"
                aria-label="Ширина карточки поста в ленте"
              >
                {FEED_POST_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={feedPostWidth === w}
                    className={`feed-post-width-btn${feedPostWidth === w ? " active" : ""}`}
                    title={
                      w === 500
                        ? "Компьютер, как сейчас"
                        : w === 390
                          ? "Планшет"
                          : "Телефон"
                    }
                    onClick={() => setFeedPostWidth(w)}
                  >
                    {w === 500 ? "Компьютер" : w === 390 ? "Планшет" : "Телефон"}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        <div className="feed-scroll" id="feed-scroll" ref={feedScrollRef}>
          <div className="feed-scroll-pane">
          <div className="feed-inner">
            {publishedDayGroups.length > 0 ? (
              <div className="feed-section feed-section--published">
                <div className="section-label">Опубликованные</div>
                <div className="feed-section-cards">
                  {publishedDayGroups.map((group) => (
                    <div className="feed-day-group" key={group.key}>
                      <div className="feed-day-marker">
                        <span>{group.label}</span>
                      </div>
                      {group.posts.map((p) => (
                        <PostCard
                          key={p.id}
                          post={p}
                          onOpen={() => openPost(p.id)}
                          onOpenComments={() => openPostComments(p.id)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="feed-section">
              <div className="section-label">Отложенные</div>
              <div className="feed-section-cards">
                {scheduled.map((p) => (
                  <PostCard key={p.id} post={p} onOpen={() => openPost(p.id)} />
                ))}
              </div>
            </div>
            <DraftsSection drafts={drafts} />
          </div>
          </div>
        </div>
        <div className="input-wrap" onMouseDown={onComposerShellMouseDown}>
          <div className="input-box">
            {pendingMedia.length > 0 ? (
              <PostMediaBlock media={pendingMedia} onRemove={removePendingMedia} />
            ) : null}
            <textarea
              ref={taRef}
              id="feed-input"
              placeholder="Написать пост..."
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
                if (e.key === "Backspace" && draft === "" && pendingMedia.length > 0) {
                  e.preventDefault();
                  setPendingMedia((arr) => arr.slice(0, -1));
                }
              }}
            />
            <div className="input-bottom">
              <div className="input-tools">
                <AttachMenu
                  scope="feed"
                  onAttach={async (att) => {
                    if (att.kind === "file" && att.file) {
                      try {
                        const media = await readFileAsMedia(att.file);
                        setPendingMedia((arr) => [...arr, media]);
                      } catch {
                        /* ignore read errors in demo */
                      }
                    }
                  }}
                />
              </div>
              <button className="send-btn" onClick={submitDraft} type="button">
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
