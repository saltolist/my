"use client";

import { useSyncExternalStore } from "react";

const ATTR = "data-page-header-le-640";

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

/** Ширина `.page-header` ≤ 640px — графики с ≤10 точками (desktop/tablet, не mobile). */
export function usePageHeaderLe640(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
