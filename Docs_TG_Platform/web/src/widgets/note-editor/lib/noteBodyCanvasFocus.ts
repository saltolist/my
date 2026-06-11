/** Не перехватывать клик по embed-ссылкам и картинкам в режиме просмотра. */
export function shouldHandleBodyCanvasPointerDown(
  target: EventTarget | null,
  canvas: HTMLElement,
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (!canvas.contains(target)) return false;
  if (target.closest(".note-body-document-edit, .note-body-line-edit")) return false;
  if (target.closest("a, button, img.note-inline-image, .note-embed-chip, .note-body-cell--embed")) {
    return false;
  }
  return true;
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

/** Сразу обновить cursor на canvas при смене view/edit (без движения мыши). */
export function refreshBodyCanvasCursor(canvas: HTMLElement, isView: boolean): void {
  canvas.style.cursor = isView ? "default" : "text";
}

/** Фокус строки тела заметки по координатам клика внутри canvas. */
export function focusNoteBodyAtPoint(canvas: HTMLElement, _clientX: number, clientY: number): boolean {
  const ta = canvas.querySelector<HTMLTextAreaElement>(".note-body-document-edit--mirror");
  if (!ta) return false;
  placeCaretInTextarea(ta, clientY);
  return true;
}
