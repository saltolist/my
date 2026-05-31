"use client";

import { useEffect, useState } from "react";
import { profileHeaderTabsCompactMq } from "@/lib/profileBreakpoints";

/** Viewport ≤ PROFILE_HEADER_TABS_COMPACT_MAX — вкладки профиля → селектор в шапке. */
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
