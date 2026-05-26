"use client";

import type { CSSProperties } from "react";
import {
  effectiveFeedPostWidth,
  feedPostWidthPhoneFormat,
  type FeedPostWidth,
} from "@/lib/feedPostWidth";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { useApp } from "@/state/AppContext";

export function useFeedPostLayout() {
  const { state } = useApp();
  const isMobile = useMobile760();
  const feedPostWidth = state.feedPostWidth;
  const effectiveWidth = effectiveFeedPostWidth(feedPostWidth, isMobile);
  const phoneFormat = feedPostWidthPhoneFormat(feedPostWidth, isMobile);

  return {
    feedPostWidth,
    effectiveWidth,
    phoneFormat,
    layoutClassName: phoneFormat ? " post-format-phone" : "",
    layoutStyle: { "--feed-post-w": `${effectiveWidth}px` } as CSSProperties,
  };
}

export type { FeedPostWidth };
