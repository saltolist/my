"use client";

import { useCallback } from "react";
import { useSendMessage } from "@/features/send-message";

export function useComposerSubmit(
  serializeEditor: () => string,
  clearEditor: () => void,
  onSubmit: (text: string) => boolean,
) {
  const sendMessage = useSendMessage(onSubmit);

  return useCallback(() => {
    sendMessage(serializeEditor(), clearEditor);
  }, [sendMessage, serializeEditor, clearEditor]);
}
