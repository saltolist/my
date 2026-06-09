"use client";

import type { Post } from "@/shared/types";

import type { ComposerTextareaHandle } from "./composer-textarea";
import { ComposerMentionDropdown } from "./composer-mention-dropdown";
import { ComposerTextarea } from "./composer-textarea";
import { AttachmentChips } from "./attachment-chips";
import type { ComposerAttachment } from "@/shared/types";

type ComposerInputAreaProps = {
  attachments: ComposerAttachment[];
  onRemoveAttachment: (id: string) => void;
  textareaRef: React.RefObject<ComposerTextareaHandle | null>;
  text: string;
  onTextChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: 10 | 16;
  mentionOpen: boolean;
  attachablePosts: Post[];
  onAttachPost: (postId: number) => void;
};

export function ComposerInputArea({
  attachments,
  onRemoveAttachment,
  textareaRef,
  text,
  onTextChange,
  onKeyDown,
  placeholder,
  disabled,
  maxRows,
  mentionOpen,
  attachablePosts,
  onAttachPost,
}: ComposerInputAreaProps) {
  return (
    <>
      <AttachmentChips attachments={attachments} onRemove={onRemoveAttachment} />
      <div className="relative">
        <ComposerTextarea
          ref={textareaRef}
          value={text}
          onChange={onTextChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxRows={maxRows}
        />
        {mentionOpen ? (
          <ComposerMentionDropdown posts={attachablePosts} onSelect={onAttachPost} />
        ) : null}
      </div>
    </>
  );
}
