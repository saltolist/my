"use client";

import { useApp } from "@/state/AppContext";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

type Ctx =
  | { scope: "gchat"; entityId: string; index: number }
  | { scope: "post"; entityId: number; index: number };

export default function ChatMessage({ message, ctx }: { message: ChatMessageType; ctx?: Ctx }) {
  const { dispatch } = useApp();
  const isUser = message.role === "user";

  let textHtml = (message.text || "").replace(/\n/g, "<br>");
  let footer: React.ReactNode = null;

  if (!isUser && Array.isArray(message.variants) && message.variants.length > 0) {
    const selectedIdx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    const selected = message.variants[selectedIdx];
    textHtml = (selected?.text || "").replace(/\n/g, "<br>");
    const showArrows = message.variants.length > 1;
    footer = (
      <div className="ai-variant-footer">
        <div className="ai-variant-label">{selected?.label || ""}</div>
        {showArrows && ctx ? (
          <div className="ai-variant-nav">
            <button
              className="ai-variant-arrow"
              onClick={() => cycle(-1, message, ctx, dispatch)}
              type="button"
            >
              ←
            </button>
            <button
              className="ai-variant-arrow"
              onClick={() => cycle(1, message, ctx, dispatch)}
              type="button"
            >
              →
            </button>
          </div>
        ) : (
          <div className="ai-variant-nav" />
        )}
      </div>
    );
  } else if (!isUser && message.targetLabel) {
    footer = (
      <div className="ai-variant-footer">
        <div className="ai-variant-label">{message.targetLabel}</div>
        <div className="ai-variant-nav" />
      </div>
    );
  }

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className="msg-body">
        <div className="msg-text" dangerouslySetInnerHTML={{ __html: textHtml }} />
        {footer}
      </div>
    </div>
  );
}

function cycle(
  delta: number,
  message: ChatMessageType,
  ctx: Ctx,
  dispatch: ReturnType<typeof useApp>["dispatch"],
) {
  if (!Array.isArray(message.variants) || message.variants.length === 0) return;
  const current = Number(message.selectedVariant) || 0;
  const next = (current + delta + message.variants.length) % message.variants.length;
  dispatch({
    type: "SET_AI_VARIANT",
    scope: ctx.scope,
    entityId: ctx.entityId,
    index: ctx.index,
    variantIdx: next,
  });
}
