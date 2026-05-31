"use client";

import { useLayoutEffect } from "react";
import { syncContentAdaptWidthToDocument } from "@/lib/contentAdaptWidth";

/** Синхронизирует --content-adapt-w и data-* для CSS-правил адаптации контента. */
export default function ContentAdaptSync() {
  useLayoutEffect(() => {
    const update = () => syncContentAdaptWidthToDocument();
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(max-width: 760px)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
      document.documentElement.style.removeProperty("--content-adapt-w");
      document.documentElement.removeAttribute("data-content-adapt-ge-761");
      document.documentElement.removeAttribute("data-content-adapt-le-949");
      document.documentElement.removeAttribute("data-content-adapt-le-1000");
      document.documentElement.removeAttribute("data-content-adapt-ge-1001");
      document.documentElement.removeAttribute("data-content-adapt-le-1300");
    };
  }, []);

  return null;
}
