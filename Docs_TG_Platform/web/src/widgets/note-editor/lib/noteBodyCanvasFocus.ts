/** Не перехватывать клик по embed-ссылкам и картинкам в режиме просмотра. */
export function shouldHandleBodyCanvasPointerDown(
  target: EventTarget | null,
  canvas: HTMLElement,
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (!canvas.contains(target)) return false;
  if (target.closest(".note-body-line-edit")) return false;
  if (target.closest("a, button, img.note-inline-image, .note-embed-chip, .note-body-cell--embed")) {
    return false;
  }
  return true;
}

function pickTextareaAtPoint(
  textareas: HTMLTextAreaElement[],
  clientY: number,
): HTMLTextAreaElement | null {
  if (textareas.length === 0) return null;

  let best = textareas[textareas.length - 1]!;
  let bestDist = Infinity;

  for (const ta of textareas) {
    const rect = ta.getBoundingClientRect();
    if (clientY >= rect.top - 6 && clientY <= rect.bottom + 6) {
      return ta;
    }
    const midY = rect.top + rect.height / 2;
    const dist = Math.abs(clientY - midY);
    if (dist < bestDist) {
      bestDist = dist;
      best = ta;
    }
  }

  return best;
}

function placeCaretInTextarea(ta: HTMLTextAreaElement, clientY: number) {
  ta.focus();
  const rect = ta.getBoundingClientRect();
  const end = ta.value.length;
  if (clientY >= rect.bottom - 4) {
    ta.setSelectionRange(end, end);
    return;
  }
  if (clientY <= rect.top + 4) {
    ta.setSelectionRange(0, 0);
    return;
  }
  ta.setSelectionRange(end, end);
}

/**
 * Браузер не пересчитывает cursor, пока курсор не сдвинется.
 * Кратко отключаем hit-test — курсор обновляется сразу при смене режима.
 */
export function refreshBodyCanvasCursor(canvas: HTMLElement): void {
  const prevPointerEvents = canvas.style.pointerEvents;
  canvas.style.pointerEvents = "none";
  requestAnimationFrame(() => {
    canvas.style.pointerEvents = prevPointerEvents;
  });
}

/** Фокус строки тела заметки по координатам клика внутри canvas. */
export function focusNoteBodyAtPoint(canvas: HTMLElement, _clientX: number, clientY: number): boolean {
  const textareas = Array.from(canvas.querySelectorAll<HTMLTextAreaElement>(".note-body-line-edit"));
  const ta = pickTextareaAtPoint(textareas, clientY);
  if (!ta) return false;
  placeCaretInTextarea(ta, clientY);
  return true;
}
