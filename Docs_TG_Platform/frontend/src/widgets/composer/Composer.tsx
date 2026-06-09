"use client";

import { useUiStore } from "@/app/model/store/ui-store";
import { useAttachFile, useAttachMedia, useAttachPost } from "@/features/attach-to-message";

import {
  COMPOSER_DEFAULT_PLACEHOLDER,
  composerMaxRows,
  composerMenuSide,
  composerStoreScope,
  type ComposerAttachScope,
} from "./model/composer-constants";
import { useComposerInput } from "./model/useComposerInput";
import { useComposerModels } from "./model/useComposerModels";
import { ComposerControls } from "./ui/composer-controls";
import { ComposerHiddenFileInput } from "./ui/composer-hidden-file-input";
import { ComposerInputArea } from "./ui/composer-input-area";
import { ComposerShell } from "./ui/composer-shell";
import { ComposerToolbar } from "./ui/composer-toolbar";
import { SendButton } from "./ui/send-button";

export type { ComposerAttachScope };

type ComposerProps = {
  scope: ComposerAttachScope;
  onSubmit: (text: string) => void | boolean | Promise<void | boolean>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  postId?: number;
};

export function Composer({
  scope,
  onSubmit,
  placeholder = COMPOSER_DEFAULT_PLACEHOLDER,
  className,
  disabled = false,
  postId,
}: ComposerProps) {
  const storeScope = composerStoreScope(scope);
  const removeAttachment = useUiStore((s) => s.removeComposerAttachment);
  const clearAttachments = useUiStore((s) => s.clearComposerAttachments);

  const { attachments, attachablePosts, attachPost } = useAttachPost(storeScope);
  const { fileInputRef, triggerFilePicker, handleFileInputChange } = useAttachFile(storeScope);
  const { currentPostMedia, attachedPostMedia, attachMedia } = useAttachMedia(storeScope, postId);

  const models = useComposerModels();
  const input = useComposerInput({ storeScope, disabled, onSubmit, clearAttachments, attachPost });

  return (
    <ComposerShell className={className}>
      <ComposerInputArea
        attachments={attachments}
        onRemoveAttachment={(id) => removeAttachment(storeScope, id)}
        textareaRef={input.textareaRef}
        text={input.text}
        onTextChange={input.handleTextChange}
        onKeyDown={input.handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxRows={composerMaxRows(scope)}
        mentionOpen={input.mentionOpen}
        attachablePosts={attachablePosts}
        onAttachPost={input.handleAttachPost}
      />
      <ComposerToolbar
        sendButton={
          <SendButton
            onClick={() => void input.handleSubmit()}
            disabled={disabled || !input.text.trim()}
          />
        }
      >
        <ComposerControls
          scope={scope}
          menuSide={composerMenuSide(scope)}
          attachablePosts={attachablePosts}
          currentPostMedia={currentPostMedia}
          attachedPostMedia={attachedPostMedia}
          onAttachFile={triggerFilePicker}
          onAttachPost={input.handleAttachPost}
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
      <ComposerHiddenFileInput inputRef={fileInputRef} onChange={handleFileInputChange} />
    </ComposerShell>
  );
}
