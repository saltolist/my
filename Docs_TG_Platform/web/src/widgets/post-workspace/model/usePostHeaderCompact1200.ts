"use client";

import { useEffect, useState } from "react";

const MQ = "(max-width: 1200px)";

/** Экран уже 1200px — в шапке поста лупа вместо постоянного поля поиска. */
export function usePostHeaderCompact1200(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MQ);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}
