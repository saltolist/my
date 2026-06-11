"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import {
  focusNoteBodyAtPoint,
  refreshBodyCanvasCursor,
  shouldHandleBodyCanvasPointerDown,
} from "@/widgets/note-editor/lib/noteBodyCanvasFocus";

type Params = {
  canvasRef: RefObject<HTMLDivElement | null>;
  isView: boolean;
  focusRequest: number;
  onEditRequest?: () => void;
};

export function useNoteBodyViewMode({ canvasRef, isView, focusRequest, onEditRequest }: Params) {
  const handledFocusRequestRef = useRef(0);
  const pendingFocusPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleViewMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isView && e.detail > 1) e.preventDefault();
    },
    [isView],
  );

  const handleViewDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (!isView || !canvas || !shouldHandleBodyCanvasPointerDown(e.target, canvas)) return;
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      pendingFocusPointRef.current = { x: e.clientX, y: e.clientY };
      onEditRequest?.();
    },
    [canvasRef, isView, onEditRequest],
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    refreshBodyCanvasCursor(canvas);
  }, [canvasRef, isView]);

  const handleEditCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (isView || !canvas || !shouldHandleBodyCanvasPointerDown(e.target, canvas)) return;
      e.preventDefault();
      focusNoteBodyAtPoint(canvas, e.clientX, e.clientY);
    },
    [canvasRef, isView],
  );

  useEffect(() => {
    if (isView) return;

    const point = pendingFocusPointRef.current;
    if (point) {
      pendingFocusPointRef.current = null;
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        focusNoteBodyAtPoint(canvas, point.x, point.y);
      });
      return;
    }

    if (focusRequest <= handledFocusRequestRef.current) return;
    handledFocusRequestRef.current = focusRequest;
    requestAnimationFrame(() => {
      const firstLine = canvasRef.current?.querySelector<HTMLTextAreaElement>(".note-body-line-edit");
      if (!firstLine) return;
      firstLine.focus();
      const end = firstLine.value.length;
      firstLine.setSelectionRange(end, end);
    });
  }, [canvasRef, focusRequest, isView]);

  return { handleViewMouseDown, handleViewDoubleClick, handleEditCanvasMouseDown };
}
