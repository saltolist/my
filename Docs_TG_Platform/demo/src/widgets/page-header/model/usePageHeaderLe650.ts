"use client";

import { useSyncExternalStore } from "react";

const ATTR = "data-page-header-le-650";

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

/** Ширина `.page-header` ≤ 650px — период аналитики платформы в шапке (desktop/tablet). */
export function usePageHeaderLe650(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
