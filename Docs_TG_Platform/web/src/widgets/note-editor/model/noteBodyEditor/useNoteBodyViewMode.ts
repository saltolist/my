"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

type Params = {
  canvasRef: RefObject<HTMLDivElement | null>;
  isView: boolean;
  focusRequest: number;
  onEditRequest?: () => void;
};

export function useNoteBodyViewMode({ canvasRef, isView, focusRequest, onEditRequest }: Params) {
  const handledFocusRequestRef = useRef(0);

  const handleViewMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isView && e.detail > 1) e.preventDefault();
    },
    [isView],
  );

  const handleViewDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      if (isView) onEditRequest?.();
    },
    [isView, onEditRequest],
  );

  useEffect(() => {
    if (isView || focusRequest <= handledFocusRequestRef.current) return;
    handledFocusRequestRef.current = focusRequest;
    requestAnimationFrame(() => {
      const firstLine = canvasRef.current?.querySelector<HTMLTextAreaElement>(".note-body-line-edit");
      if (!firstLine) return;
      firstLine.focus();
      const end = firstLine.value.length;
      firstLine.setSelectionRange(end, end);
    });
  }, [canvasRef, focusRequest, isView]);

  return { handleViewMouseDown, handleViewDoubleClick };
}
