"use client";

import { useCallback, useRef, useState } from "react";

import type { ComposerScope } from "@/shared/types";

import type { ComposerTextareaHandle } from "../ui/composer-textarea";

type UseComposerInputOptions = {
  storeScope: ComposerScope;
  disabled: boolean;
  onSubmit: (text: string) => void | boolean | Promise<void | boolean>;
  clearAttachments: (scope: ComposerScope) => void;
  attachPost: (postId: number) => void;
};

export function useComposerInput({
  storeScope,
  disabled,
  onSubmit,
  clearAttachments,
  attachPost,
}: UseComposerInputOptions) {
  const [text, setText] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const textareaRef = useRef<ComposerTextareaHandle>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    const result = await onSubmit(trimmed);
    if (result === false) return;
    setText("");
    clearAttachments(storeScope);
    textareaRef.current?.resetHeight();
  }, [clearAttachments, disabled, onSubmit, storeScope, text]);

  const handleAttachPost = useCallback(
    (postId: number) => {
      attachPost(postId);
      setMentionOpen(false);
      setText((prev) => prev.replace(/@$/, "").trimEnd());
    },
    [attachPost],
  );

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    const atIdx = value.lastIndexOf("@");
    setMentionOpen(atIdx >= 0 && atIdx === value.length - 1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  return {
    text,
    mentionOpen,
    textareaRef,
    handleSubmit,
    handleAttachPost,
    handleTextChange,
    handleKeyDown,
  };
}
