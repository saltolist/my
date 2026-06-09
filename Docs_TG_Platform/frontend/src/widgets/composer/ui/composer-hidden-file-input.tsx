"use client";

import type { RefObject } from "react";

type ComposerHiddenFileInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ComposerHiddenFileInput({ inputRef, onChange }: ComposerHiddenFileInputProps) {
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
