"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { autoResize, getPostMediaItems, postTitle, shortComposerLabel, truncate } from "@/lib/helpers";
import type { ComposerScope, Post } from "@/lib/types";
import { postById } from "@/state/AppContext";

type Props = {
  scope: ComposerScope;
  placeholder?: string;
  onSubmit: (text: string) => boolean;
  showPin?: boolean;
};

export default function Composer({ scope, placeholder, onSubmit, showPin = false }: Props) {
  const { state, setComposerLlm, setComposerWeb } = useApp();
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const cfg = state.aiProfileConfig;
  const target = state.composerTargets[scope];
  const llmOptions = cfg.llmModels.filter((m) => m.provider && m.model && m.active);
  const webOptions = cfg.webSearchModels.filter((m) => m.provider && m.model && m.active);
  const isMulti = cfg.multiResponseEnabled;

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current);
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setAttachOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function submit() {
    const text = value.trim();
    if (!text) return;
    const ok = onSubmit(text);
    if (ok) setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function applyAttachment(text: string) {
    if (scope === "gchat" || scope === "post") {
      onSubmit(text);
    } else {
      setValue((v) => (v.trim() ? `${v}\n${text}` : text));
    }
    setAttachOpen(false);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    applyAttachment(`Прикрепил файл: ${file.name}`);
    e.target.value = "";
  }

  return (
    <div className="input-wrap">
      <div className="input-box">
        <textarea
          ref={taRef}
          id={`${scope}-input`}
          placeholder={placeholder || "Написать сообщение..."}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="input-bottom">
          <div className="input-tools">
            {showPin ? (
              <button className="icon-btn" title="Закрепить посты в контексте" type="button">
                📌
              </button>
            ) : null}
            <div className="ctx-wrap" ref={wrapRef}>
              <button
                className="icon-btn"
                title="Прикрепить"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttachOpen((v) => !v);
                }}
              >
                📎
              </button>
              <AttachDropdown
                open={attachOpen}
                scope={scope}
                onPickPostMedia={applyAttachment}
                onTriggerFile={() => fileInputRef.current?.click()}
              />
            </div>
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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFilePicked}
      />
    </div>
  );
}

function AttachDropdown({
  open,
  scope,
  onPickPostMedia,
  onTriggerFile,
}: {
  open: boolean;
  scope: ComposerScope;
  onPickPostMedia: (text: string) => void;
  onTriggerFile: () => void;
}) {
  const { state } = useApp();
  const post = scope === "post" ? postById(state, state.currentPostId) : null;
  const localMedia = scope === "post" && post ? getPostMediaItems(post) : [];
  const pinnedMedia = scope !== "post" ? collectPinnedMedia(state.posts, state.pinnedPostIds) : [];

  return (
    <div className={`ctx-dropdown attach-dropdown${open ? " open" : ""}`}>
      {scope === "post" ? (
        localMedia.length > 0 ? (
          localMedia.map((m, i) => (
            <div
              key={i}
              className="ctx-item"
              onClick={() => onPickPostMedia(`Прикрепил медиа из поста: ${m}`)}
            >
              🖼 Медиа из поста: {truncate(String(m), 28)}
            </div>
          ))
        ) : (
          <div className="ctx-item disabled">🖼 В посте нет медиа</div>
        )
      ) : pinnedMedia.length > 0 ? (
        pinnedMedia.map((item, i) => (
          <div
            key={i}
            className="ctx-item"
            onClick={() => onPickPostMedia(`Прикрепил медиа из поста «${item.postTitle}»: ${item.media}`)}
          >
            🖼 {truncate(item.postTitle, 16)}: {truncate(String(item.media), 20)}
          </div>
        ))
      ) : (
        <div className="ctx-item disabled">🖼 В запиненных постах нет медиа</div>
      )}
      <div className="ctx-item" onClick={onTriggerFile}>
        📎 Прикрепить файл с компьютера
      </div>
    </div>
  );
}

function collectPinnedMedia(posts: Post[], pinned: number[]) {
  return posts
    .filter((p) => pinned.includes(p.id))
    .flatMap((p) => {
      if (Array.isArray(p.media)) return p.media.map((m) => ({ postId: p.id, media: m, postTitle: postTitle(p) }));
      if (typeof p.media === "string" && p.media.trim()) {
        return [{ postId: p.id, media: p.media.trim(), postTitle: postTitle(p) }];
      }
      return [];
    });
}
