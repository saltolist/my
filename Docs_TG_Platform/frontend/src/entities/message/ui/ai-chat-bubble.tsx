import { AiMessageToolbar } from "@/entities/message/ui/ai-message-toolbar";
import { AiVariantTabs } from "@/entities/message/ui/ai-variant-tabs";
import { MessageText } from "@/entities/message/ui/chat-bubble";
import type { ChatMessage } from "@/shared/types";

function displayAiText(message: ChatMessage): string {
  if (message.role !== "ai") return "";
  if (message.variants?.length) {
    const idx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    return message.variants[idx]?.text ?? "";
  }
  return message.text ?? "";
}

function aiVariantIndex(message: ChatMessage): number {
  if (!message.variants?.length) return 0;
  return Math.min(
    Math.max(Number(message.selectedVariant) || 0, 0),
    message.variants.length - 1,
  );
}

export type AiChatBubbleProps = {
  message: ChatMessage;
  path: number[];
  onAiVariantChange?: (path: number[], variantIdx: number) => void;
};

export function AiChatBubble({ message, path, onAiVariantChange }: AiChatBubbleProps) {
  const text = displayAiText(message);
  const variants = message.variants ?? [];
  const variantIdx = aiVariantIndex(message);
  const activeVariant = variants[variantIdx];

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[min(100%,42rem)] flex-col gap-2">
        {variants.length > 1 ? (
          <AiVariantTabs
            variants={variants}
            variantIdx={variantIdx}
            onVariantChange={(idx) => onAiVariantChange?.(path, idx)}
          />
        ) : (
          <MessageText text={text} />
        )}

        <AiMessageToolbar
          text={text}
          llmLabel={message.llmLabel}
          webLabel={message.webLabel}
          activeVariant={activeVariant}
        />
      </div>
    </div>
  );
}
