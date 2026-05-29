"use client";

import { useEffect, useState } from "react";

const MQ = "(max-width: 999px)";

/** Экран уже 1000px — вкладки профиля и аналогичные элементы шапки → селектор. */
export function useCompactHeader1000(): boolean {
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
