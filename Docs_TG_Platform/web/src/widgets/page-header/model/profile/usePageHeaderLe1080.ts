"use client";

import { useSyncExternalStore } from "react";

const ATTR = "data-page-header-le-1080";

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

/** Ширина `.page-header` ≤ 1080px — графики с ≤15 точками (desktop/tablet, не mobile). */
export function usePageHeaderLe1080(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
