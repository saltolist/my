"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { domainActions, selectPosts, useDomainDispatch, useDomainSelector } from "@/app/model/store";
import { useNavigation, useUi } from "@/app/model/store";
import {
  FEED_POST_WIDTH_SELECT_OPTIONS,
  isFeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import { useFeedPostLayout } from "@/widgets/feed";
import { buildPublishedFeedDayGroups } from "@/shared/lib/feedTimeline";
import {
  buildFeedPostSections,
  canSubmitFeedDraft,
  createDraftPost,
} from "@/shared/lib/feed/filterPosts";
import {
  clampScrollTop,
  getFeedScrollTop,
  getFeedSessionDidInitialScroll,
  markFeedSessionInitialScrollDone,
  setFeedScrollTop,
} from "@/shared/lib/feed/feedScrollSession";
import { isFeedPath } from "@/shared/lib/feed/isFeedPath";
import { autoResize, readFileAsMedia } from "@/shared/lib/helpers";
import type { PostMedia } from "@/shared/types";

export function useFeedScreen() {
  const posts = useDomainSelector(selectPosts);
  const dispatch = useDomainDispatch();
  const { openPost, openPostComments } = useNavigation();
  const { setFeedPostWidth } = useUi();
  const pathname = usePathname() ?? "/";
  const onFeed = isFeedPath(pathname);
  const { feedPostWidth, layoutClassName, layoutStyle } = useFeedPostLayout();

  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PostMedia[]>([]);
  const [search, setSearch] = useState("");
  const [composerReady, setComposerReady] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current, 16);
  }, [draft]);

  const { published, scheduled, drafts } = useMemo(
    () => buildFeedPostSections(posts, search),
    [posts, search],
  );
  const publishedDayGroups = useMemo(
    () => buildPublishedFeedDayGroups(published),
    [published],
  );

  useEffect(() => {
    const el = feedScrollRef.current;
    if (!el || !onFeed) return;
    const onScroll = () => setFeedScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onFeed]);

  useLayoutEffect(() => {
    const el = feedScrollRef.current;
    if (!el || !onFeed) return;

    setComposerReady(false);

    const pinToBottom = () => {
      el.scrollTop = el.scrollHeight;
      setFeedScrollTop(el.scrollTop);
    };

    const restoreScroll = () => {
      el.scrollTop = clampScrollTop(getFeedScrollTop(), el.scrollHeight, el.clientHeight);
    };

    const syncScroll = () => {
      if (!getFeedSessionDidInitialScroll()) pinToBottom();
      else restoreScroll();
    };

    syncScroll();

    const scrollBody = el.querySelector<HTMLElement>(".composer-scroll-body");
    let ro: ResizeObserver | null = null;
    if (scrollBody) {
      ro = new ResizeObserver(() => syncScroll());
      ro.observe(scrollBody);
    }

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      syncScroll();
      raf2 = requestAnimationFrame(() => {
        syncScroll();
        if (!getFeedSessionDidInitialScroll()) {
          pinToBottom();
          markFeedSessionInitialScrollDone();
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
    if (!canSubmitFeedDraft(draft, pendingMedia.length)) return;
    const newPost = createDraftPost({ text: draft, pendingMedia });
    dispatch(domainActions.updatePosts([...posts, newPost]));
    setDraft("");
    setPendingMedia([]);
  }, [draft, dispatch, pendingMedia, posts]);

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
    data: {
      publishedDayGroups,
      scheduled,
      drafts,
    },
    ui: {
      feedPostWidth,
      layoutClassName,
      layoutStyle,
      search,
      setSearch,
      feedPostWidthSelectProps,
      composerReady,
      taRef,
      draft,
      setDraft,
      pendingMedia,
      feedScrollRef,
    },
    actions: {
      setFeedPostWidth,
      openPost,
      openPostComments,
      submitDraft,
      removePendingMedia,
      handleDraftKeyDown,
      handleAttach,
    },
  };
}

export type FeedScreenState = ReturnType<typeof useFeedScreen>;
