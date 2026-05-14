"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import AiMessageToolbar from "./AiMessageToolbar";

type Ctx =
  | { scope: "gchat"; entityId: string; index: number }
  | { scope: "post"; postId: number; entityId: number; index: number }; // entityId = local chat id

function assistantPlainText(message: ChatMessageType): string {
  if (message.role !== "ai") return "";
  if (Array.isArray(message.variants) && message.variants.length > 0) {
    const selectedIdx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    return message.variants[selectedIdx]?.text ?? "";
  }
  return message.text ?? "";
}

/** Строка для подсказки «какая модель ответила» (LLM ± поиск). */
function modelTooltipText(message: ChatMessageType): string {
  if (message.role !== "ai") return "";
  if (Array.isArray(message.variants) && message.variants.length > 0) {
    const selectedIdx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    const sel = message.variants[selectedIdx];
    const llm = sel?.llmCaption?.trim() ?? "";
    const web = sel?.webCaption?.trim() ?? "";
    if (llm && web) return `${llm} + ${web}`;
    if (llm) return llm;
    if (web) return web;
    return (sel?.label ?? "").trim();
  }
  const llm = message.llmLabel?.trim() ?? "";
  const web = message.webLabel?.trim() ?? "";
  if (llm && web) return `${llm} + ${web}`;
  if (llm) return llm;
  if (web) return web;
  return (message.targetLabel ?? "").trim();
}

async function copyPlainText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function IcUserEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IcUserCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function ChatMessage({ message, ctx }: { message: ChatMessageType; ctx?: Ctx }) {
  const { dispatch } = useApp();
  const isUser = message.role === "user";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text ?? "");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(message.text ?? "");
  }, [message.text, editing]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      const len = taRef.current.value.length;
      taRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  useLayoutEffect(() => {
    if (!editing) return;
    const ta = taRef.current;
    if (!ta) return;
    const cap = 360;
    ta.style.height = "auto";
    const sh = ta.scrollHeight;
    ta.style.height = `${Math.min(sh, cap)}px`;
    ta.style.overflowY = sh > cap ? "auto" : "hidden";
  }, [draft, editing]);

  let textHtml = (message.text || "").replace(/\n/g, "<br>");
  let aiFooterLeft: ReactNode = null;

  if (!isUser && Array.isArray(message.variants) && message.variants.length > 0) {
    const selectedIdx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    const selected = message.variants[selectedIdx];
    textHtml = (selected?.text || "").replace(/\n/g, "<br>");
    const showArrows = message.variants.length > 1;
    if (showArrows && ctx) {
      aiFooterLeft = (
        <div className="ai-variant-footer ai-variant-footer--nav-only">
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
        </div>
      );
    }
  }

  const plainAi = assistantPlainText(message);
  const modelTitle = modelTooltipText(message);

  const onCopyUser = useCallback(async () => {
    const t = message.text ?? "";
    const ok = await copyPlainText(t);
    if (!ok) return;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopied(true);
    copyTimer.current = setTimeout(() => {
      setCopied(false);
      copyTimer.current = null;
    }, 2000);
  }, [message.text]);

  const startEdit = useCallback(() => {
    if (!ctx) return;
    setDraft(message.text ?? "");
    setEditing(true);
  }, [ctx, message.text]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(message.text ?? "");
  }, [message.text]);

  const saveEdit = useCallback(() => {
    if (!ctx) return;
    const text = draft.trim();
    if (text === "") return;
    if (ctx.scope === "gchat") {
      dispatch({ type: "UPDATE_GLOBAL_CHAT_MESSAGE", chatId: ctx.entityId, index: ctx.index, text });
    } else {
      dispatch({
        type: "UPDATE_LOCAL_CHAT_MESSAGE",
        postId: ctx.postId,
        chatId: ctx.entityId,
        index: ctx.index,
        text,
      });
    }
    setEditing(false);
  }, [ctx, draft, dispatch]);

  if (isUser) {
    return (
      <div className="msg-row user">
        <div
          className={`msg-user-hover-zone${editing ? " msg-user-hover-zone--editing" : ""}`}
        >
          {ctx && !editing ? (
            <div className="msg-user-side-actions">
              <button
                type="button"
                className="ai-msg-action-btn"
                aria-label="Редактировать"
                title="Редактировать"
                onClick={startEdit}
              >
                <IcUserEdit />
              </button>
              <button
                type="button"
                className={`ai-msg-action-btn${copied ? " on" : ""}`}
                aria-label={copied ? "Скопировано" : "Скопировать"}
                title={copied ? "Скопировано" : "Скопировать"}
                onClick={() => void onCopyUser()}
              >
                {copied ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <IcUserCopy />
                )}
              </button>
            </div>
          ) : null}
          <div className="msg-body">
            {editing ? (
              <div className="msg-user-edit-wrap">
                <textarea
                  ref={taRef}
                  className="msg-user-edit"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  spellCheck={false}
                  aria-label="Текст сообщения"
                />
                <div className="msg-user-edit-bar">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                    Отмена
                  </button>
                  <button type="button" className="btn btn-sm btn-user-edit-done" onClick={saveEdit}>
                    Готово
                  </button>
                </div>
              </div>
            ) : (
              <div className="msg-text" dangerouslySetInnerHTML={{ __html: textHtml }} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className="msg-body">
        <div className="msg-text" dangerouslySetInnerHTML={{ __html: textHtml }} />
        {!isUser && (
          <div className="ai-msg-footer">
            <div className="ai-msg-footer-left">{aiFooterLeft}</div>
            <AiMessageToolbar plainText={plainAi} modelTitle={modelTitle} />
          </div>
        )}
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
