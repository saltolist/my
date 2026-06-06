"use client";

import type { CSSProperties } from "react";
import {
  effectiveFeedPostWidth,
  feedPostWidthPhoneFormat,
  type FeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import { useUi } from "@/app/model/store";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";

export function useFeedPostLayout() {
  const { feedPostWidth } = useUi();
  const isMobile = useMobile760();
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
