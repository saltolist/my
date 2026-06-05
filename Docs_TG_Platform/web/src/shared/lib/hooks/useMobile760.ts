"use client";

import { useEffect, useState } from "react";

const MQ = "(max-width: 760px)";

export function useMobile760(): boolean {
  /** Всегда false до mount — совпадает с SSR и убирает hydration mismatch. */
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MQ);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}
