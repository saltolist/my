"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  open: boolean;
  isMobile: boolean;
  wrapRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
};

/** Закрытие мобильного поиска в шапке при любом касании вне поля (в т.ч. скролл). */
export function useMobileHeaderSearchDismiss({
  open,
  isMobile,
  wrapRef,
  inputRef,
  onClose,
}: Options) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || !isMobile) return;

    const dismissIfOutside = (target: Node | null) => {
      const wrap = wrapRef.current;
      if (wrap && target && wrap.contains(target)) return;
      inputRef.current?.blur();
      onCloseRef.current();
    };

    const onTouchStart = (e: TouchEvent) => {
      dismissIfOutside(e.target as Node | null);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      dismissIfOutside(e.target as Node | null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isMobile, wrapRef, inputRef]);
}
