"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";

const MOBILE_MQ = "(max-width: 760px)";
const EDGE_PX = 24;
const COMMIT_RATIO = 0.38;

type TouchTrack = {
  x0: number;
  y0: number;
  fromEdge: boolean;
  locked: boolean;
};

export default function MobileBackGesture() {
  const {
    canNavigateBack,
    getPreviousRouteTitle,
    popNavigationHistory,
    mobileSidebarOpen,
  } = useApp();
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const trackRef = useRef<TouchTrack | null>(null);
  const committedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const setShift = useCallback((px: number, dragging: boolean) => {
    const app = document.getElementById("app");
    if (!app) return;
    app.style.setProperty("--mobile-back-dx", `${px}px`);
    app.classList.toggle("mobile-back-dragging", dragging);
    app.classList.toggle("mobile-back-active", dragging && px > 0);
  }, []);

  const resetGesture = useCallback(() => {
    trackRef.current = null;
    committedRef.current = false;
    setShift(0, false);
    setPreviewTitle(null);
  }, [setShift]);

  const finishCommit = useCallback(() => {
    const app = document.getElementById("app");
    const main = document.getElementById("main");
    if (!app || !main) {
      resetGesture();
      popNavigationHistory();
      return;
    }
    const target = Math.min(window.innerWidth, main.offsetWidth);
    app.classList.add("mobile-back-finishing");
    setShift(target, false);
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      main.removeEventListener("transitionend", onEnd);
      app.classList.remove("mobile-back-finishing");
      resetGesture();
      popNavigationHistory();
    };
    const onEnd = () => complete();
    main.addEventListener("transitionend", onEnd);
    window.setTimeout(complete, 280);
  }, [popNavigationHistory, resetGesture, setShift]);

  const finishCancel = useCallback(() => {
    const main = document.getElementById("main");
    const app = document.getElementById("app");
    if (!main || !app) {
      resetGesture();
      return;
    }
    app.classList.add("mobile-back-finishing");
    setShift(0, false);
    const onEnd = () => {
      main.removeEventListener("transitionend", onEnd);
      app.classList.remove("mobile-back-finishing");
      resetGesture();
    };
    main.addEventListener("transitionend", onEnd);
    window.setTimeout(() => {
      main.removeEventListener("transitionend", onEnd);
      app.classList.remove("mobile-back-finishing");
      resetGesture();
    }, 280);
  }, [resetGesture, setShift]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);

    function applyMove(track: TouchTrack, x: number, y: number) {
      const dx = Math.max(0, x - track.x0);
      const dy = y - track.y0;
      if (!track.locked) {
        if (dx < 8 && Math.abs(dy) > 12) {
          resetGesture();
          return;
        }
        if (dx > 10 && dx > Math.abs(dy) * 1.2) {
          track.locked = true;
          setPreviewTitle(getPreviousRouteTitle());
        }
      }
      if (!track.locked) return;
      const max = window.innerWidth * 0.92;
      setShift(Math.min(dx, max), true);
    }

    function onTouchStart(e: TouchEvent) {
      if (!mq.matches || mobileSidebarOpen || !canNavigateBack()) return;
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE_PX) return;
      trackRef.current = { x0: t.clientX, y0: t.clientY, fromEdge: true, locked: false };
      committedRef.current = false;
    }

    function onTouchMove(e: TouchEvent) {
      const track = trackRef.current;
      if (!track || committedRef.current || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (track.locked && e.cancelable) e.preventDefault();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        applyMove(track, t.clientX, t.clientY);
      });
    }

    function onTouchEnd(e: TouchEvent) {
      const track = trackRef.current;
      if (!track || committedRef.current) {
        resetGesture();
        return;
      }
      const t = e.changedTouches[0];
      const dx = Math.max(0, t.clientX - track.x0);
      const commitAt = window.innerWidth * COMMIT_RATIO;
      if (track.locked && dx >= commitAt) {
        committedRef.current = true;
        finishCommit();
      } else if (track.locked) {
        finishCancel();
      } else {
        resetGesture();
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      resetGesture();
    };
  }, [
    canNavigateBack,
    finishCancel,
    finishCommit,
    getPreviousRouteTitle,
    mobileSidebarOpen,
    resetGesture,
    setShift,
  ]);

  if (!previewTitle) return null;

  return (
    <div id="mobile-back-underlay" className="mobile-back-underlay" aria-hidden>
      <span className="mobile-back-underlay-hint">Назад</span>
      <span className="mobile-back-underlay-title">{previewTitle}</span>
    </div>
  );
}
