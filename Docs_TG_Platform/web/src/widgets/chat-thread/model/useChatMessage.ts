"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  assistantPlainText,
  copyPlainText,
  messageTextHtml,
  modelTooltipText,
  type ChatMessageCtx,
} from "@/entities/message";
import { displayUserText } from "@/shared/lib/chatPaths";
import type { ChatMessage as ChatMessageType } from "@/shared/types";

type Props = {
  message: ChatMessageType;
  ctx?: ChatMessageCtx;
};

export function useChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const userShown = displayUserText(message);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const textHtml = messageTextHtml(message, userShown);
  const plainAi = assistantPlainText(message);
  const modelTitle = modelTooltipText(message);

  const aiVariantCount = message.variants?.length ?? 0;
  const aiVariantIdx = Math.min(
    Math.max(Number(message.selectedVariant) || 0, 0),
    Math.max(aiVariantCount - 1, 0),
  );

  const onCopyUser = useCallback(async () => {
    const ok = await copyPlainText(userShown);
    if (!ok) return;
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  }, [userShown, setCopied]);

  return {
    isUser,
    textHtml,
    plainAi,
    modelTitle,
    editing: false,
    draft: userShown,
    editSession: 0,
    copied,
    userActionsOpen: false,
    userHoverZoneRef: { current: null },
    taRef: { current: null },
    userBranchCount: message.userBranches?.length ?? 1,
    userBranchIdx: message.activeUserBranch ?? 0,
    aiVariantCount,
    aiVariantIdx,
    setDraft: () => undefined,
    onEditKeyDown: () => undefined,
    saveEdit: () => undefined,
    cancelEdit: () => undefined,
    startEdit: () => undefined,
    onCopyUser,
    openUserActionsOnMobile: () => undefined,
    bumpUserBranch: () => undefined,
    bumpAiVariant: () => undefined,
    deleteMessage: () => undefined,
  };
}
