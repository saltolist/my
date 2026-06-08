"use client";

import { useUiStore } from "@/app/model/store/ui-store";
import { useAttachFile, useAttachMedia, useAttachPost } from "@/features/attach-to-message";
import type { ComposerScope } from "@/shared/types";

import { useComposerInput } from "./model/useComposerInput";
import { useComposerModels } from "./model/useComposerModels";
import { AttachmentChips } from "./ui/attachment-chips";
import { ComposerControls } from "./ui/composer-controls";
import { ComposerMentionDropdown } from "./ui/composer-mention-dropdown";
import { ComposerShell } from "./ui/composer-shell";
import { ComposerTextarea } from "./ui/composer-textarea";
import { ComposerToolbar } from "./ui/composer-toolbar";
import { SendButton } from "./ui/send-button";

export type ComposerAttachScope = ComposerScope | "feed";

type ComposerProps = {
  scope: ComposerAttachScope;
  onSubmit: (text: string) => void | boolean | Promise<void | boolean>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  postId?: number;
};

const DEFAULT_PLACEHOLDER = "Сообщение... введите @ чтобы прикрепить пост";

export function Composer({
  scope,
  onSubmit,
  placeholder = DEFAULT_PLACEHOLDER,
  className,
  disabled = false,
  postId,
}: ComposerProps) {
  const storeScope: ComposerScope = scope === "feed" ? "home" : scope;
  const removeAttachment = useUiStore((s) => s.removeComposerAttachment);
  const clearAttachments = useUiStore((s) => s.clearComposerAttachments);

  const { attachments, attachablePosts, attachPost } = useAttachPost(storeScope);
  const { fileInputRef, triggerFilePicker, handleFileInputChange } = useAttachFile(storeScope);
  const { currentPostMedia, attachedPostMedia, attachMedia } = useAttachMedia(storeScope, postId);

  const models = useComposerModels();
  const {
    text,
    mentionOpen,
    textareaRef,
    handleSubmit,
    handleAttachPost,
    handleTextChange,
    handleKeyDown,
  } = useComposerInput({
    storeScope,
    disabled,
    onSubmit,
    clearAttachments,
    attachPost,
  });

  const maxRows = scope === "home" ? 10 : 16;
  const menuSide = scope === "home" ? "bottom" : "top";

  return (
    <ComposerShell className={className}>
      <AttachmentChips
        attachments={attachments}
        onRemove={(id) => removeAttachment(storeScope, id)}
      />

      <div className="relative">
        <ComposerTextarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxRows={maxRows}
        />
        {mentionOpen ? (
          <ComposerMentionDropdown posts={attachablePosts} onSelect={handleAttachPost} />
        ) : null}
      </div>

      <ComposerToolbar
        sendButton={
          <SendButton
            onClick={() => void handleSubmit()}
            disabled={disabled || !text.trim()}
          />
        }
      >
        <ComposerControls
          scope={scope}
          menuSide={menuSide}
          attachablePosts={attachablePosts}
          currentPostMedia={currentPostMedia}
          attachedPostMedia={attachedPostMedia}
          onAttachFile={triggerFilePicker}
          onAttachPost={handleAttachPost}
          onAttachMedia={attachMedia}
          llmOptions={models.llmOptions}
          llmId={models.llmId}
          onLlmChange={models.setLlmId}
          webOptions={models.webOptions}
          webId={models.webId}
          onWebChange={models.setWebId}
          showMultiReply={models.showMultiReply}
          multiReply={models.multiReply}
          onMultiReplyChange={models.setMultiReply}
        />
      </ComposerToolbar>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileInputChange}
      />
    </ComposerShell>
  );
}
