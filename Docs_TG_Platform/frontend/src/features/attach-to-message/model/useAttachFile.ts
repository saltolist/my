"use client";

import { useCallback, useRef } from "react";

import { useUiStore } from "@/app/model/store/ui-store";
import type { ComposerAttachment, ComposerScope } from "@/shared/types";

export function useAttachFile(scope: ComposerScope) {
  const attachments = useUiStore((s) => s.composerAttachments[scope]);
  const addAttachment = useUiStore((s) => s.addComposerAttachment);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachFile = useCallback(
    (file: File) => {
      const att: ComposerAttachment = {
        id: `file-${attachments.length}`,
        kind: "file",
        name: file.name,
        file,
      };
      addAttachment(scope, att);
    },
    [addAttachment, attachments.length, scope],
  );

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) attachFile(file);
      e.target.value = "";
    },
    [attachFile],
  );

  return { fileInputRef, attachFile, triggerFilePicker, handleFileInputChange };
}
