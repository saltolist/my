"use client";

import { useLayoutEffect } from "react";

import { syncContentAdaptWidthToDocument } from "@/shared/lib/contentAdaptWidth";
import { clearProfileAdaptFromDocument } from "@/shared/lib/profileBreakpoints";

function syncPlatformToDocument() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  document.documentElement.toggleAttribute("data-platform-android", isAndroid);
}

/** Синхронизирует --content-adapt-w и data-* для CSS-правил адаптации контента. */
export function ContentAdaptSync() {
  useLayoutEffect(() => {
    const update = () => {
      syncContentAdaptWidthToDocument();
      syncPlatformToDocument();
    };
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(max-width: 760px)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
      document.documentElement.style.removeProperty("--content-adapt-w");
      document.documentElement.removeAttribute("data-content-adapt-ge-761");
      document.documentElement.removeAttribute("data-content-adapt-le-1000");
      document.documentElement.removeAttribute("data-shell-overlay");
      document.documentElement.removeAttribute("data-platform-android");
      clearProfileAdaptFromDocument();
    };
  }, []);

  return null;
}
