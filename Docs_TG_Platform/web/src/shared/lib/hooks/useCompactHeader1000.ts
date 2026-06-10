"use client";

import { useEffect, useState } from "react";

import { profileHeaderTabsCompactMq } from "@/shared/lib/profileBreakpoints";

/** Viewport ≤ 1000px — вкладки в шапке поста уходят в overflow. */
export function useCompactHeader1000(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(profileHeaderTabsCompactMq);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}
