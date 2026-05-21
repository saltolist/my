"use client";

import type { MouseEvent } from "react";
import { BrainIcon } from "@/components/composer/ModelPicker";

/** Переключатель «в контексте ИИ» в карточке — визуал как чекбокс в профиле, вместо галочки мозг. */
export default function NoteCardAiToggle({
  ai,
  onClick,
}: {
  ai: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ai}
      className={`note-ai-toggle${ai ? " on" : " off"}`}
      onClick={onClick}
      aria-label={ai ? "Заметка в контексте ИИ" : "Заметка не в контексте ИИ"}
    >
      <BrainIcon />
    </button>
  );
}
