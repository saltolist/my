"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { autoResize, postTitle, shortComposerLabel, truncate } from "@/lib/helpers";
import type { ComposerAttachment, ComposerScope, Post } from "@/lib/types";
import AttachMenu from "./AttachMenu";

type Props = {
  scope: ComposerScope;
  placeholder?: string;
  onSubmit: (text: string) => boolean;
};

export default function Composer({ scope, placeholder, onSubmit }: Props) {
  const { state, setComposerLlm, setComposerWeb } = useApp();
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const cfg = state.aiProfileConfig;
  const target = state.composerTargets[scope];
  const llmOptions = cfg.llmModels.filter((m) => m.provider && m.model && m.active);
  const webOptions = cfg.webSearchModels.filter((m) => m.provider && m.model && m.active);
  const isMulti = cfg.multiResponseEnabled;

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current);
  }, [value]);

  function addAttachment(att: ComposerAttachment) {
    setAttachments((prev) => {
      if (att.kind === "post" && prev.some((p) => p.kind === "post" && p.postId === att.postId)) {
        return prev;
      }
      if (
        att.kind === "media" &&
        prev.some(
          (p) => p.kind === "media" && p.postId === att.postId && p.media === att.media,
        )
      ) {
        return prev;
      }
      return [...prev, att];
    });
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function candidatePostsForMention(): Post[] {
    if (scope === "post") {
      return state.posts.filter((p) => p.id !== state.currentPostId);
    }
    return state.posts;
  }

  function tryParseMention(input: string): { value: string; matched?: Post } {
    if (!input.endsWith(";")) return { value: input };
    const lastAt = input.lastIndexOf("@", input.length - 2);
    if (lastAt < 0) return { value: input };
    const between = input.slice(lastAt + 1, input.length - 1).trim();
    if (!between) return { value: input };
    if (between.includes("\n")) return { value: input };
    const lower = between.toLowerCase();
    const candidates = candidatePostsForMention();
    const matched =
      candidates.find((p) => postTitle(p).toLowerCase() === lower) ||
      candidates.find((p) => postTitle(p).toLowerCase().startsWith(lower)) ||
      candidates.find((p) => postTitle(p).toLowerCase().includes(lower));
    if (!matched) return { value: input };
    const before = input.slice(0, lastAt).replace(/\s+$/, "");
    return { value: before, matched };
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    const parsed = tryParseMention(next);
    if (parsed.matched) {
      setValue(parsed.value);
      addAttachment({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: "post",
        postId: parsed.matched.id,
        title: postTitle(parsed.matched),
      });
      return;
    }
    setValue(next);
  }

  function formatAttachment(a: ComposerAttachment): string {
    if (a.kind === "post") return `@${a.title}`;
    if (a.kind === "file") return `Прикрепил файл: ${a.name}`;
    return `Прикрепил медиа из поста «${a.postTitle}»: ${a.media}`;
  }

  function submit() {
    const text = value.trim();
    const lines: string[] = [];
    if (text) lines.push(text);
    for (const a of attachments) lines.push(formatAttachment(a));
    if (lines.length === 0) return;
    const ok = onSubmit(lines.join("\n"));
    if (ok) {
      setValue("");
      setAttachments([]);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Backspace" && value === "" && attachments.length > 0) {
      e.preventDefault();
      setAttachments((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="input-wrap">
      <div className="input-box">
        {attachments.length > 0 ? (
          <div className="attach-chips">
            {attachments.map((a) => (
              <Chip key={a.id} att={a} onRemove={() => removeAttachment(a.id)} />
            ))}
          </div>
        ) : null}
        <textarea
          ref={taRef}
          id={`${scope}-input`}
          placeholder={placeholder || "Написать сообщение..."}
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <div className="input-bottom">
          <div className="input-tools">
            <AttachMenu scope={scope} onAttach={addAttachment} />
          </div>
          <div className="composer-mode">
            {!isMulti ? (
              <>
                <select
                  id={`composer-llm-${scope}`}
                  className="composer-select"
                  value={target?.llmId || ""}
                  onChange={(e) => setComposerLlm(scope, e.target.value)}
                  disabled={llmOptions.length === 0}
                >
                  {llmOptions.length > 0 ? (
                    llmOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {shortComposerLabel(`${m.provider} / ${m.model}`)}
                      </option>
                    ))
                  ) : (
                    <option value="">Нет LLM моделей</option>
                  )}
                </select>
                <select
                  id={`composer-web-${scope}`}
                  className="composer-select"
                  value={target?.webId || ""}
                  onChange={(e) => setComposerWeb(scope, e.target.value)}
                >
                  <option value="">Нет</option>
                  {webOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {shortComposerLabel(`${m.provider} / ${m.model}`)}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <input
                id={`composer-multi-${scope}`}
                className="composer-select composer-multi-input"
                value="Мультиответ"
                disabled
                readOnly
              />
            )}
          </div>
          <div style={{ flex: 1 }} />
          <button className="send-btn" onClick={submit} type="button">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ att, onRemove }: { att: ComposerAttachment; onRemove: () => void }) {
  const icon = att.kind === "post" ? "📝" : att.kind === "file" ? "📎" : "🖼";
  const label =
    att.kind === "post"
      ? `@${att.title}`
      : att.kind === "file"
        ? att.name
        : `${att.postTitle} · ${att.media}`;
  return (
    <span className="attach-chip" title={label}>
      <span className="attach-chip-icon">{icon}</span>
      <span className="attach-chip-label">{truncate(label, 32)}</span>
      <button
        type="button"
        className="attach-chip-remove"
        onClick={onRemove}
        aria-label="Удалить вложение"
      >
        ×
      </button>
    </span>
  );
}
