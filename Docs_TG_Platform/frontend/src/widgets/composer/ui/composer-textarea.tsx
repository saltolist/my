"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "@/shared/lib/utils";
import { Textarea } from "@/shared/ui/textarea";

export type ComposerTextareaHandle = {
  resetHeight: () => void;
  focus: () => void;
};

type ComposerTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: 10 | 16;
};

function autoResize(textarea: HTMLTextAreaElement, maxRows: number) {
  const style = window.getComputedStyle(textarea);
  const lineHeight = parseFloat(style.lineHeight) || 20;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

  textarea.style.height = "auto";
  const scrollHeight = textarea.scrollHeight;

  if (scrollHeight > maxHeight) {
    textarea.style.height = `${maxHeight}px`;
    textarea.style.overflowY = "auto";
  } else {
    textarea.style.height = `${scrollHeight}px`;
    textarea.style.overflowY = "hidden";
  }
}

export const ComposerTextarea = forwardRef<ComposerTextareaHandle, ComposerTextareaProps>(
  function ComposerTextarea(
    { value, onChange, onKeyDown, placeholder, disabled, maxRows = 16 },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      resetHeight: () => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      },
      focus: () => textareaRef.current?.focus(),
    }));

    useEffect(() => {
      if (textareaRef.current) autoResize(textareaRef.current, maxRows);
    }, [value, maxRows]);

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "min-h-10 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
        )}
        aria-label="Сообщение"
      />
    );
  },
);
