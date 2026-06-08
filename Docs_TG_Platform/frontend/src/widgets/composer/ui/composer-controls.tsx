"use client";

import { Brain } from "lucide-react";

import type { MediaAttachItem } from "@/features/attach-to-message";
import type { Post } from "@/shared/types";
import { ModelPicker, MultiReplyToggle, WebSearchPicker } from "@/shared/ui";
import type { ModelPickerOption } from "@/shared/ui/model-picker";

import { AttachMenu, type AttachMenuScope } from "./attach-menu";
import { AttachMenuButton } from "./attach-menu-button";

type ComposerControlsProps = {
  scope: AttachMenuScope;
  menuSide: "top" | "bottom";
  attachablePosts: Post[];
  currentPostMedia: MediaAttachItem[];
  attachedPostMedia: MediaAttachItem[];
  onAttachFile: () => void;
  onAttachPost: (postId: number) => void;
  onAttachMedia: (postId: number, mediaName: string) => void;
  llmOptions: ModelPickerOption[];
  llmId: string;
  onLlmChange: (id: string) => void;
  webOptions: ModelPickerOption[];
  webId: string;
  onWebChange: (id: string) => void;
  showMultiReply: boolean;
  multiReply: boolean;
  onMultiReplyChange: (checked: boolean) => void;
};

export function ComposerControls({
  scope,
  menuSide,
  attachablePosts,
  currentPostMedia,
  attachedPostMedia,
  onAttachFile,
  onAttachPost,
  onAttachMedia,
  llmOptions,
  llmId,
  onLlmChange,
  webOptions,
  webId,
  onWebChange,
  showMultiReply,
  multiReply,
  onMultiReplyChange,
}: ComposerControlsProps) {
  return (
    <>
      {scope === "feed" ? (
        <AttachMenuButton onClick={onAttachFile} />
      ) : (
        <AttachMenu
          scope={scope}
          menuSide={menuSide}
          attachablePosts={attachablePosts}
          currentPostMedia={currentPostMedia}
          attachedPostMedia={attachedPostMedia}
          onAttachFile={onAttachFile}
          onAttachPost={onAttachPost}
          onAttachMedia={onAttachMedia}
        />
      )}
      <ModelPicker
        label="LLM"
        icon={<Brain className="size-3.5" />}
        options={llmOptions}
        value={llmId}
        onChange={onLlmChange}
        emptyLabel="Нет LLM"
      />
      <WebSearchPicker options={webOptions} value={webId} onChange={onWebChange} />
      {showMultiReply ? (
        <MultiReplyToggle checked={multiReply} onCheckedChange={onMultiReplyChange} />
      ) : null}
    </>
  );
}
