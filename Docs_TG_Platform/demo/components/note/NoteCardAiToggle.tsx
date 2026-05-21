"use client";

import { useState, type MouseEvent } from "react";
import { BrainIcon } from "@/components/composer/ModelPicker";

/** Переключатель «в контексте ИИ» в карточке — hover как у ProfileCheckbox. */
export default function NoteCardAiToggle({
  ai,
  onClick,
}: {
  ai: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [suppressHover, setSuppressHover] = useState(false);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ai}
      className={`note-ai-toggle${ai ? " on" : " off"}${suppressHover ? " note-ai-toggle--suppress-hover" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
        setSuppressHover(true);
        e.currentTarget.blur();
      }}
      onMouseLeave={() => setSuppressHover(false)}
      aria-label={ai ? "Заметка в контексте ИИ" : "Заметка не в контексте ИИ"}
    >
      <BrainIcon />
    </button>
  );
}
