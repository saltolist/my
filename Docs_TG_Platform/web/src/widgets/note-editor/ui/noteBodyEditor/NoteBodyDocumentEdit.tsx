"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { splitBodyHighlightParts } from "@/shared/lib/noteEmbeds/lineHighlight";

type Props = {
  body: string;
  onChange: (body: string) => void;
};

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function renderHighlight(body: string): ReactNode {
  const parts = splitBodyHighlightParts(body);
  if (parts.length === 0) {
    return "\u00a0";
  }

  const nodes: ReactNode[] = [];
  parts.forEach((part, index) => {
    if (part.type === "embed") {
      nodes.push(
        <span key={`embed-${index}`} className="note-embed-token">
          {part.value}
        </span>,
      );
      return;
    }
    nodes.push(part.value);
  });
  return nodes;
}

export default function NoteBodyDocumentEdit({ body, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) autoGrow(textareaRef.current);
  }, [body]);

  return (
    <div className="note-body-document note-body-document--edit">
      <div className="note-body-document-edit-stack">
        <div className="note-body-document-edit-highlight" aria-hidden>
          {renderHighlight(body)}
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
