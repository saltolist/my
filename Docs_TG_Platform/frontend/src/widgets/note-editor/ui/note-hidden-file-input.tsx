"use client";

import type { RefObject } from "react";

type NoteHiddenFileInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function NoteHiddenFileInput({ inputRef, onChange }: NoteHiddenFileInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      accept="image/*,video/*,.pdf,.doc,.docx"
      onChange={onChange}
    />
  );
}
