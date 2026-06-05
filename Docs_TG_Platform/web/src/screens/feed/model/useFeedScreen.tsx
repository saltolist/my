"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDomain } from "@/app/model/store/domain-store";
import { useNavigation } from "@/app/model/store/navigation-store";
import { useUi } from "@/app/model/store/ui-store";
import {
  FEED_POST_WIDTH_SELECT_OPTIONS,
  isFeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import { useFeedPostLayout } from "@/widgets/feed";
import { buildPublishedFeedDayGroups, sortPostsByPublicationTime } from "@/shared/lib/feedTimeline";
import { autoResize, postTitle, readFileAsMedia } from "@/shared/lib/helpers";
import type { Post, PostMedia } from "@/shared/types";

/** Позиция скролла ленты между визитами в SPA (без полной перезагрузки). */
let feedScrollTopMemory = 0;
/** Первый визит на ленту в сессии: после гидрации статики — докрутить вниз, когда известна высота. */
let feedSessionDidInitialScroll = false;

export function useFeedScreen() {
  const { state: domain, dispatch } = useDomain();
  const { openPost, openPostComments } = useNavigation();
  const { setFeedPostWidth } = useUi();
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
  const matchPost = useCallback(
    (p: Post) =>
      !q ||
      postTitle(p).toLowerCase().includes(q) ||
      (p.text || "").toLowerCase().includes(q),
    [q],
  );

  const published = useMemo(
    () => domain.posts.filter((p) => p.status === "published" && matchPost(p)),
    [domain.posts, matchPost],
  );
  const publishedDayGroups = useMemo(
    () => buildPublishedFeedDayGroups(published),
    [published],
  );
  const scheduled = useMemo(
    () =>
      sortPostsByPublicationTime(
        domain.posts.filter((p) => p.status === "scheduled" && matchPost(p)),
        "asc",
      ),
    [domain.posts, matchPost],
  );
  const drafts = useMemo(
    () => domain.posts.filter((p) => p.status === "draft" && matchPost(p)),
    [domain.posts, matchPost],
  );

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
    let ro: ResizeObserver | null = null;
    if (scrollBody) {
      ro = new ResizeObserver(() => {
        syncScroll();
      });
      ro.observe(scrollBody);
    }

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

  const submitDraft = useCallback(() => {
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
    dispatch({ type: "UPDATE_POSTS", posts: [...domain.posts, newPost] });
    setDraft("");
    setPendingMedia([]);
  }, [draft, dispatch, pendingMedia, domain.posts]);

  const removePendingMedia = useCallback((index: number) => {
    setPendingMedia((arr) => arr.filter((_, i) => i !== index));
  }, []);

  const handleDraftKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitDraft();
      }
      if (e.key === "Backspace" && draft === "" && pendingMedia.length > 0) {
        e.preventDefault();
        setPendingMedia((arr) => arr.slice(0, -1));
      }
    },
    [draft, pendingMedia.length, submitDraft],
  );

  const handleAttach = useCallback(async (att: { kind: string; file?: File }) => {
    if (att.kind === "file" && att.file) {
      try {
        const media = await readFileAsMedia(att.file);
        setPendingMedia((arr) => [...arr, media]);
      } catch {
        /* ignore read errors (clipboard, permissions) */
      }
    }
  }, []);

  const feedPostWidthSelectProps = useMemo(
    () => ({
      ariaLabel: "Ширина карточки поста в ленте",
      value: String(feedPostWidth),
      options: FEED_POST_WIDTH_SELECT_OPTIONS,
      onChange: (v: string) => {
        const n = Number(v);
        if (isFeedPostWidth(n)) setFeedPostWidth(n);
      },
    }),
    [feedPostWidth, setFeedPostWidth],
  );

  return {
    feedPostWidth,
    setFeedPostWidth,
    layoutClassName,
    layoutStyle,
    search,
    setSearch,
    feedPostWidthSelectProps,
    feedScrollRef,
    publishedDayGroups,
    scheduled,
    drafts,
    openPost,
    openPostComments,
    composerReady,
    taRef,
    draft,
    setDraft,
    pendingMedia,
    submitDraft,
    removePendingMedia,
    handleDraftKeyDown,
    handleAttach,
  };
}

export type FeedScreenState = ReturnType<typeof useFeedScreen>;
