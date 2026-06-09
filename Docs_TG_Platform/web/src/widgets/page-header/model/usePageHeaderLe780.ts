"use client";

import { useSyncExternalStore } from "react";

const ATTR = "data-page-header-le-780";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [ATTR],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.hasAttribute(ATTR);
}

function getServerSnapshot() {
  return false;
}

/** Ширина `.page-header` ≤ 780px (см. PROFILE_HEADER_TOP_POSTS_COMPACT_MAX). */
export function usePageHeaderLe780(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
