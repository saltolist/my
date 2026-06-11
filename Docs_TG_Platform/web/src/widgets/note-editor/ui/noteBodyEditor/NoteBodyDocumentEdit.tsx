"use client";

import { useEffect, useRef } from "react";

import { splitBodyHighlightParts } from "@/shared/lib/noteEmbeds/lineHighlight";

type Props = {
  body: string;
  onChange: (body: string) => void;
};

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function NoteBodyDocumentEdit({ body, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parts = splitBodyHighlightParts(body);

  useEffect(() => {
    if (textareaRef.current) autoGrow(textareaRef.current);
  }, [body]);

  return (
    <div className="note-body-document note-body-document--edit">
      <div className="note-body-document-edit-stack">
        <div className="note-body-document-edit-highlight" aria-hidden>
          {parts.length > 0 ? (
            parts.map((part, index) =>
              part.type === "embed" ? (
                <span key={index} className="note-embed-token">
                  {part.value}
                </span>
              ) : (
                <span key={index}>{part.value}</span>
              ),
            )
          ) : (
            <span>{"\u00a0"}</span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          className="note-body-document-edit note-body-document-edit--mirror"
          value={body}
          rows={1}
          spellCheck
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
