"use client";

import { NoteIconAttach, NoteIconImage } from "@/components/note/NoteHeaderIcons";

export function AttachMenuIconAttach() {
  return (
    <span className="attach-item-icon" aria-hidden>
      <NoteIconAttach size={18} />
    </span>
  );
}

export function AttachMenuIconImage() {
  return (
    <span className="attach-item-icon" aria-hidden>
      <NoteIconImage size={18} />
    </span>
  );
}
