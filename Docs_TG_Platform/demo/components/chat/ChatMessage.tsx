"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { clampActiveBranchIndex, displayUserText } from "@/lib/chatPaths";
import { isOmnichannelChatId } from "@/lib/omnichannel";
import { BrainIcon } from "@/components/composer/ModelPicker";
import AiMessageToolbar from "./AiMessageToolbar";

type Ctx =
  | { scope: "gchat"; entityId: string; path: number[] }
  | { scope: "post"; postId: number; entityId: number; path: number[] };

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

/** Шеврон как у раскрытия списков в сайдбаре; `dir` — влево / вправо. */
function BranchChevronIcon({ dir }: { dir: "left" | "right" }) {
  const points = dir === "left" ? "15 6 9 12 15 18" : "9 6 15 12 9 18";
  return (
    <svg className="msg-user-branch-chevron-svg" viewBox="0 0 24 24" width={12} height={12} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatMessage({
  message,
  ctx,
  isLastAssistantMessage = false,
}: {
  message: ChatMessageType;
  ctx?: Ctx;
  /** Показывать «Удалить» в меню только у последнего ответа ассистента в треде. */
  isLastAssistantMessage?: boolean;
}) {
  const { dispatch } = useApp();
  const isUser = message.role === "user";
  const userShown = displayUserText(message);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(userShown);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(userShown);
  }, [userShown, editing]);

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

  let textHtml = (isUser ? userShown : message.text ?? "").replace(/\n/g, "<br>");
  let aiVariantNav: ReactNode = null;
  let aiVariantCount = 0;
  let aiVariantIdx = 0;

  if (!isUser && Array.isArray(message.variants) && message.variants.length > 0) {
    const selectedIdx = Math.min(
      Math.max(Number(message.selectedVariant) || 0, 0),
      message.variants.length - 1,
    );
    const selected = message.variants[selectedIdx];
    textHtml = (selected?.text || "").replace(/\n/g, "<br>");
    aiVariantCount = message.variants.length;
    aiVariantIdx = selectedIdx;
  }

  const plainAi = assistantPlainText(message);
  const modelTitle = modelTooltipText(message);

  const onCopyUser = useCallback(async () => {
    const t = userShown;
    const ok = await copyPlainText(t);
    if (!ok) return;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopied(true);
    copyTimer.current = setTimeout(() => {
      setCopied(false);
      copyTimer.current = null;
    }, 2000);
  }, [userShown]);

  const startEdit = useCallback(() => {
    if (!ctx) return;
    setDraft(userShown);
    setEditing(true);
  }, [ctx, userShown]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(userShown);
  }, [userShown]);

  const saveEdit = useCallback(() => {
    if (!ctx) return;
    const text = draft.trim();
    if (text === "") return;
    if (ctx.scope === "gchat") {
      dispatch({ type: "UPDATE_GLOBAL_CHAT_MESSAGE", chatId: ctx.entityId, path: ctx.path, text });
    } else {
      dispatch({
        type: "UPDATE_LOCAL_CHAT_MESSAGE",
        postId: ctx.postId,
        chatId: ctx.entityId,
        path: ctx.path,
        text,
      });
    }
    setEditing(false);
  }, [ctx, draft, dispatch]);

  const omnichannelEdit =
    ctx?.scope === "gchat" && isOmnichannelChatId(ctx.entityId);
  const userBranchCount = omnichannelEdit ? 0 : (message.userBranches?.length ?? 0);
  const userBranchIdx = isUser && userBranchCount > 0 ? clampActiveBranchIndex(message) : 0;

  const canGoBranchPrev = userBranchIdx > 0;
  const canGoBranchNext = userBranchIdx < userBranchCount - 1;

  const bumpUserBranch = useCallback(
    (delta: number) => {
      if (!ctx || userBranchCount < 2) return;
      const next = (userBranchIdx + delta + userBranchCount) % userBranchCount;
      if (ctx.scope === "gchat") {
        dispatch({
          type: "SET_USER_BRANCH",
          scope: "gchat",
          entityId: ctx.entityId,
          path: ctx.path,
          branchIdx: next,
        });
      } else {
        dispatch({
          type: "SET_USER_BRANCH",
          scope: "post",
          postId: ctx.postId,
          entityId: ctx.entityId,
          path: ctx.path,
          branchIdx: next,
        });
      }
    },
    [ctx, dispatch, userBranchCount, userBranchIdx],
  );

  const canGoVariantPrev = aiVariantIdx > 0;
  const canGoVariantNext = aiVariantIdx < aiVariantCount - 1;

  const bumpAiVariant = useCallback(
    (delta: number) => {
      if (!ctx || aiVariantCount < 2) return;
      const next = aiVariantIdx + delta;
      if (next < 0 || next >= aiVariantCount) return;
      dispatch({
        type: "SET_AI_VARIANT",
        scope: ctx.scope,
        entityId: ctx.entityId,
        path: ctx.path,
        variantIdx: next,
      });
    },
    [ctx, dispatch, aiVariantCount, aiVariantIdx],
  );

  if (!isUser && aiVariantCount > 1 && ctx) {
    aiVariantNav = (
      <div className="msg-user-branch-row msg-ai-variant-row">
        <button
          type="button"
          className="msg-user-branch-arrow"
          aria-label={canGoVariantPrev ? "Предыдущая модель" : "Предыдущей модели нет"}
          title={canGoVariantPrev ? "Предыдущая модель" : "Предыдущей модели нет"}
          disabled={!canGoVariantPrev}
          onClick={() => bumpAiVariant(-1)}
        >
          <BranchChevronIcon dir="left" />
        </button>
        <span
          className={`ai-msg-model-hint msg-ai-variant-model${modelTitle.trim() ? "" : " msg-ai-variant-model--empty"}`}
          role="img"
          tabIndex={modelTitle.trim() ? 0 : undefined}
          aria-label={modelTitle.trim() ? `Модель: ${modelTitle}` : "Модель"}
          title={modelTitle.trim() || undefined}
          data-tooltip={modelTitle.trim() || undefined}
        >
          <span className="ai-msg-toolbar-model-ico" aria-hidden>
            <BrainIcon />
          </span>
        </span>
        <button
          type="button"
          className="msg-user-branch-arrow"
          aria-label={canGoVariantNext ? "Следующая модель" : "Следующей модели нет"}
          title={canGoVariantNext ? "Следующая модель" : "Следующей модели нет"}
          disabled={!canGoVariantNext}
          onClick={() => bumpAiVariant(1)}
        >
          <BranchChevronIcon dir="right" />
        </button>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="msg-row user">
        <div
          className={`msg-user-hover-zone${editing ? " msg-user-hover-zone--editing" : ""}`}
        >
          <div className="msg-user-stack">
            <div className="msg-user-bubble-row">
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
            {ctx && userBranchCount > 1 && !editing ? (
              <div className="msg-user-branch-row">
                <button
                  type="button"
                  className="msg-user-branch-arrow"
                  aria-label={canGoBranchPrev ? "Предыдущая версия" : "Предыдущей версии нет"}
                  title={canGoBranchPrev ? "Предыдущая версия" : "Предыдущей версии нет"}
                  disabled={!canGoBranchPrev}
                  onClick={() => bumpUserBranch(-1)}
                >
                  <BranchChevronIcon dir="left" />
                </button>
                <span className="msg-user-branch-count">
                  {userBranchIdx + 1}/{userBranchCount}
                </span>
                <button
                  type="button"
                  className="msg-user-branch-arrow"
                  aria-label={canGoBranchNext ? "Следующая версия" : "Следующей версии нет"}
                  title={canGoBranchNext ? "Следующая версия" : "Следующей версии нет"}
                  disabled={!canGoBranchNext}
                  onClick={() => bumpUserBranch(1)}
                >
                  <BranchChevronIcon dir="right" />
                </button>
              </div>
            ) : null}
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
            <div className="ai-msg-footer-left">{aiVariantNav}</div>
            <AiMessageToolbar
              plainText={plainAi}
              onDelete={
                ctx && isLastAssistantMessage
                  ? () => {
                      if (ctx.scope === "gchat") {
                        dispatch({
                          type: "DELETE_GLOBAL_CHAT_MESSAGE",
                          chatId: ctx.entityId,
                          path: ctx.path,
                        });
                      } else {
                        dispatch({
                          type: "DELETE_LOCAL_CHAT_MESSAGE",
                          postId: ctx.postId,
                          chatId: ctx.entityId,
                          path: ctx.path,
                        });
                      }
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
