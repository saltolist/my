"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/state/AppContext";
import { FEED_POST_WIDTHS, feedPostWidthLabel } from "@/lib/feedPostWidth";
import { useFeedPostLayout } from "@/lib/hooks/useFeedPostLayout";
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

/** Позиция скролла ленты между визитами в SPA (без полной перезагрузки). */
let feedScrollTopMemory = 0;
/** Первый визит на ленту в сессии: после гидрации статики — докрутить вниз, когда известна высота. */
let feedSessionDidInitialScroll = false;

export default function FeedScreen() {
  const { state, dispatch, openPost, openPostComments, setFeedPostWidth } = useApp();
  const pathname = usePathname() ?? "/";
  const onFeed = pathname === "/feed/" || pathname === "/feed";
  const { feedPostWidth, layoutClassName, layoutStyle } = useFeedPostLayout();
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PostMedia[]>([]);
  const [search, setSearch] = useState("");
  /** Маска composer показывается только после layout — иначе при гидрации /feed виден «лишний» прямоугольник. */
  const [composerReady, setComposerReady] = useState(false);
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

  useLayoutEffect(() => {
    const el = feedScrollRef.current;
    if (!el || !onFeed) return;

    setComposerReady(false);

    const pinToBottom = () => {
      el.scrollTop = el.scrollHeight;
      feedScrollTopMemory = el.scrollTop;
    };

    const restoreScroll = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTop = Math.min(feedScrollTopMemory, max);
    };

    const syncScroll = () => {
      if (!feedSessionDidInitialScroll) pinToBottom();
      else restoreScroll();
    };

    syncScroll();

    const scrollBody = el.querySelector<HTMLElement>(".composer-scroll-body");
    const ro =
      scrollBody &&
      new ResizeObserver(() => {
        syncScroll();
      });
    ro?.observe(scrollBody);

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      syncScroll();
      raf2 = requestAnimationFrame(() => {
        syncScroll();
        if (!feedSessionDidInitialScroll) {
          pinToBottom();
          feedSessionDidInitialScroll = true;
        }
        setComposerReady(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro?.disconnect();
    };
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
    <div className={`feed-screen-wrap${layoutClassName}`} style={layoutStyle}>
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
              role="group"
              aria-label="Ширина карточки поста в ленте"
            >
              {FEED_POST_WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`feed-post-width-btn${feedPostWidth === w ? " active" : ""}`}
                  onClick={() => setFeedPostWidth(w)}
                >
                  {feedPostWidthLabel(w)}
                </button>
              ))}
            </div>
          </div>
        }
      />
      <div className="feed-layout">
        <div className="composer-scroll-wrap">
          <div className="feed-scroll" id="feed-scroll" ref={feedScrollRef}>
            <div className="composer-scroll-body">
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
        </div>
        <div
          className={`input-wrap${composerReady ? " is-composer-ready" : ""}`}
          onMouseDown={onComposerShellMouseDown}
        >
          <div className="composer-backdrop" aria-hidden="true" />
          <div className="input-box">
            {pendingMedia.length > 0 ? (
              <PostMediaBlock media={pendingMedia} onRemove={removePendingMedia} />
            ) : null}
            <textarea
              ref={taRef}
              id="feed-input"
              placeholder="Написать пост..."
              rows={1}
              autoComplete="off"
              suppressHydrationWarning
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
