"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/state/AppContext";
import { feedNavIconSvgMarkup } from "@/components/sidebar/NavIcons";
import {
  attachmentPostTitle,
  postFreshness,
  postStatusLabel,
  postTitle,
  truncate,
} from "@/lib/helpers";
import type { ComposerAttachment, ComposerScope, Post } from "@/lib/types";
import AttachMenu from "./AttachMenu";
import ModelPicker, { BrainIcon, SearchIcon } from "./ModelPicker";
import { formatWebSearchComposerLabel, isWebSearchVisibleForLlm } from "@/lib/composer-config";
import { onComposerShellMouseDown } from "@/lib/composerPointerDown";

type Props = {
  scope: ComposerScope;
  placeholder?: string;
  onSubmit: (text: string) => boolean;
};

type MentionState = {
  textNode: Text;
  atOffset: number;
  caretOffset: number;
  query: string;
} | null;

type MentionPos =
  | { mode: "up"; bottom: number; left: number; width: number }
  | { mode: "down"; top: number; left: number; width: number };

const MAX_MENTION_RESULTS = 8;

const DEFAULT_PLACEHOLDER = "Сообщение... введите @ чтобы прикрепить пост";

let attachCounter = 0;
function nextAttachId(): string {
  attachCounter += 1;
  return `att-${Date.now()}-${attachCounter}`;
}

function chipIcon(att: ComposerAttachment): string {
  if (att.kind === "file") return "📎";
  return "🖼";
}

function chipLabel(att: ComposerAttachment): string {
  if (att.kind === "post") return att.title;
  if (att.kind === "file") return att.name;
  return `${att.postTitle} · ${att.media}`;
}

function serializeChip(att: ComposerAttachment): string {
  if (att.kind === "post") return `Пост «${att.title}»`;
  if (att.kind === "file") return `Прикрепил файл: ${att.name}`;
  return `Прикрепил медиа из поста «${att.postTitle}»: ${att.media}`;
}

export default function Composer({ scope, placeholder, onSubmit }: Props) {
  const { state, setComposerLlm, setComposerWeb } = useApp();
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mention, setMention] = useState<MentionState>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionPos, setMentionPos] = useState<MentionPos | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<ComposerAttachment[]>([]);
  attachmentsRef.current = attachments;

  const placement: "up" | "down" = scope === "home" ? "down" : "up";

  const cfg = state.aiProfileConfig;
  const target = state.composerTargets[scope];
  const llmOptions = cfg.llmModels.filter((m) => m.provider && m.model && m.active);
  const webOptionsAll = cfg.webSearchModels.filter((m) => m.provider && m.model && m.active);
  const selectedLlm = llmOptions.find((m) => m.id === target?.llmId);
  const webOptions = webOptionsAll.filter((m) => isWebSearchVisibleForLlm(m, selectedLlm));
  const webValue =
    target?.webId && webOptions.some((m) => m.id === target.webId) ? target.webId : "";
  const isMulti = cfg.multiResponseEnabled;

  const effectivePlaceholder = placeholder || DEFAULT_PLACEHOLDER;

  const attachedPostIds = useMemo(
    () =>
      attachments
        .filter((a): a is Extract<ComposerAttachment, { kind: "post" }> => a.kind === "post")
        .map((a) => a.postId),
    [attachments],
  );

  const mentionCandidates = useMemo<Post[]>(() => {
    const base = state.posts.filter((p) => {
      if (attachedPostIds.includes(p.id)) return false;
      if (scope === "post" && p.id === state.currentPostId) return false;
      return true;
    });
    return [...base].sort((a, b) => postFreshness(b) - postFreshness(a) || b.id - a.id);
  }, [state.posts, state.currentPostId, scope, attachedPostIds]);

  const mentionMatches = useMemo<Post[]>(() => {
    if (!mention) return [];
    const q = mention.query.trim().toLowerCase();
    if (!q) return mentionCandidates.slice(0, MAX_MENTION_RESULTS);
    return mentionCandidates
      .filter((p) => postTitle(p).toLowerCase().includes(q))
      .slice(0, MAX_MENTION_RESULTS);
  }, [mention, mentionCandidates]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mention?.query, mentionMatches.length]);

  const isEditorEmpty = useCallback((): boolean => {
    const el = editorRef.current;
    if (!el) return true;
    if (el.querySelector(".inline-chip")) return false;
    const text = (el.textContent || "")
      .replace(/[\u200b\u00a0]/g, "")
      .replace(/\s/g, "")
      .trim();
    return text.length === 0;
  }, []);

  const pruneOrphanComposerSpaces = useCallback((editor: HTMLElement) => {
    Array.from(editor.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const raw = node.textContent || "";
      if (raw.replace(/[\u200b\u00a0\s]/g, "").length === 0) node.remove();
    });
  }, []);

  const syncEmptyEditorDom = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    pruneOrphanComposerSpaces(editor);
    if (!isEditorEmpty()) return;
    editor.innerHTML = "";
    editor.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStart(editor, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [isEditorEmpty, pruneOrphanComposerSpaces]);

  const refreshIsEmpty = useCallback(() => {
    setIsEmpty(isEditorEmpty());
  }, [isEditorEmpty]);

  function createChipElement(att: ComposerAttachment): HTMLSpanElement {
    const el = document.createElement("span");
    el.className = "inline-chip";
    el.contentEditable = "false";
    el.setAttribute("data-attach-id", att.id);
    el.setAttribute("data-attach-kind", att.kind);
    el.title = chipLabel(att);

    const icon = document.createElement("span");
    icon.className = "inline-chip-icon";
    if (att.kind === "post") {
      icon.innerHTML = feedNavIconSvgMarkup(14);
    } else {
      icon.textContent = chipIcon(att);
    }
    el.appendChild(icon);

    const label = document.createElement("span");
    label.className = "inline-chip-label";
    label.textContent = truncate(chipLabel(att), 36);
    el.appendChild(label);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "inline-chip-remove";
    remove.setAttribute("aria-label", "Удалить вложение");
    remove.contentEditable = "false";
    remove.textContent = "×";
    remove.addEventListener("mousedown", (e) => e.preventDefault());
    remove.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeChipById(att.id);
    });
    el.appendChild(remove);

    return el;
  }

  function removeChipById(id: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const chip = editor.querySelector(`[data-attach-id="${CSS.escape(id)}"]`);
    if (chip) {
      const next = chip.nextSibling;
      const prev = chip.previousSibling;
      chip.remove();
      if (next?.nodeType === Node.TEXT_NODE) {
        const t = next.textContent || "";
        if (t.replace(/[\u200b\u00a0\s]/g, "").length === 0) next.remove();
      }
      if (prev?.nodeType === Node.TEXT_NODE) {
        const t = prev.textContent || "";
        if (t.replace(/[\u200b\u00a0\s]/g, "").length === 0) prev.remove();
      }
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    pruneOrphanComposerSpaces(editor);
    refreshIsEmpty();
    requestAnimationFrame(() => {
      syncEmptyEditorDom();
      refreshIsEmpty();
    });
  }

  function detectMentionFromSelection(): MentionState {
    const editor = editorRef.current;
    if (!editor) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return null;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;
    const text = node.textContent || "";
    const caret = range.startOffset;
    let atIdx = -1;
    for (let i = caret - 1; i >= 0; i -= 1) {
      const ch = text[i];
      if (ch === "@") {
        atIdx = i;
        break;
      }
      if (ch === " " || ch === "\n" || ch === "\t" || ch === ";") return null;
    }
    if (atIdx < 0) return null;
    const before = atIdx === 0 ? "" : text[atIdx - 1];
    if (before && !/[\s\n]/.test(before)) return null;
    const query = text.slice(atIdx + 1, caret);
    if (query.length > 60) return null;
    return { textNode: node as Text, atOffset: atIdx, caretOffset: caret, query };
  }

  function refreshMention() {
    setMention(detectMentionFromSelection());
  }

  function collectAttachmentsFromDom(): ComposerAttachment[] {
    const editor = editorRef.current;
    if (!editor) return [];
    const ids = new Set<string>();
    editor.querySelectorAll<HTMLElement>(".inline-chip").forEach((el) => {
      const id = el.getAttribute("data-attach-id");
      if (id) ids.add(id);
    });
    return attachmentsRef.current.filter((a) => ids.has(a.id));
  }

  function serializeEditor(): string {
    const editor = editorRef.current;
    if (!editor) return "";
    const segments: string[] = [];
    const present = new Map<string, ComposerAttachment>(
      attachmentsRef.current.map((a) => [a.id, a]),
    );
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        segments.push(node.textContent || "");
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains("inline-chip")) {
          const id = el.getAttribute("data-attach-id");
          const att = id ? present.get(id) : null;
          if (att) segments.push(serializeChip(att));
          return;
        }
        if (el.tagName === "BR") {
          segments.push("\n");
          return;
        }
        if (el.tagName === "DIV" || el.tagName === "P") {
          segments.push("\n");
        }
        el.childNodes.forEach((c) => walk(c));
        return;
      }
    };
    editor.childNodes.forEach((c) => walk(c));
    return segments.join("").replace(/\n{3,}/g, "\n\n").trim();
  }

  function clearEditor() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = "";
    setAttachments([]);
    setMention(null);
    refreshIsEmpty();
  }

  function placeCaretAfter(node: Node) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function addAttachmentInline(att: ComposerAttachment) {
    const editor = editorRef.current;
    if (!editor) return;
    if (att.kind === "post" && attachmentsRef.current.some((a) => a.kind === "post" && a.postId === att.postId)) {
      return;
    }
    if (
      att.kind === "media" &&
      attachmentsRef.current.some(
        (a) => a.kind === "media" && a.postId === att.postId && a.media === att.media,
      )
    ) {
      return;
    }
    const chip = createChipElement(att);
    const sel = window.getSelection();
    let inserted = false;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editor.contains(range.startContainer)) {
        range.deleteContents();
        range.insertNode(chip);
        const space = document.createTextNode("\u00A0");
        chip.parentNode?.insertBefore(space, chip.nextSibling);
        placeCaretAfter(space);
        inserted = true;
      }
    }
    if (!inserted) {
      editor.appendChild(chip);
      const space = document.createTextNode("\u00A0");
      editor.appendChild(space);
      placeCaretAfter(space);
      editor.focus();
    }
    setAttachments((prev) => [...prev, att]);
    refreshIsEmpty();
  }

  function pickMention(post: Post) {
    if (!mention) return;
    const { textNode, atOffset, caretOffset } = mention;
    if (!editorRef.current?.contains(textNode)) return;
    const text = textNode.textContent || "";
    if (atOffset < 0 || atOffset > text.length || caretOffset < atOffset) return;
    const before = text.slice(0, atOffset);
    let after = text.slice(caretOffset);
    after = after.replace(/^;\s*/, "");
    textNode.textContent = before;
    const chip = createChipElement({
      id: nextAttachId(),
      kind: "post",
      postId: post.id,
      title: attachmentPostTitle(post),
    });
    const parent = textNode.parentNode;
    if (!parent) return;
    if (textNode.nextSibling) {
      parent.insertBefore(chip, textNode.nextSibling);
    } else {
      parent.appendChild(chip);
    }
    const spaceText = after.startsWith(" ") || after.startsWith("\u00A0") ? after : "\u00A0" + after;
    const tail = document.createTextNode(spaceText);
    if (chip.nextSibling) {
      parent.insertBefore(tail, chip.nextSibling);
    } else {
      parent.appendChild(tail);
    }
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.setStart(tail, 1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setAttachments((prev) => [
      ...prev,
      {
        id: chip.getAttribute("data-attach-id") as string,
        kind: "post",
        postId: post.id,
        title: attachmentPostTitle(post),
      },
    ]);
    setMention(null);
    refreshIsEmpty();
  }

  function onEditorInput() {
    const live = collectAttachmentsFromDom();
    if (live.length !== attachmentsRef.current.length) {
      setAttachments(live);
    }
    refreshIsEmpty();
    refreshMention();
  }

  function submit() {
    const text = serializeEditor();
    if (!text) return;
    const ok = onSubmit(text);
    if (ok) clearEditor();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (mention && mentionMatches.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionMatches.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionMatches.length) % mentionMatches.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickMention(mentionMatches[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMention(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
      return;
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const parts = text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) range.insertNode(document.createElement("br"));
      if (part) range.insertNode(document.createTextNode(part));
      range.collapse(false);
    });
    refreshIsEmpty();
    refreshMention();
  }

  const updateMentionPos = useCallback(() => {
    const box = inputBoxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    if (placement === "down") {
      setMentionPos({ mode: "down", top: r.bottom + 6, left: r.left, width: r.width });
    } else {
      setMentionPos({
        mode: "up",
        bottom: window.innerHeight - r.top + 6,
        left: r.left,
        width: r.width,
      });
    }
  }, [placement]);

  useLayoutEffect(() => {
    if (mention && mentionMatches.length > 0) updateMentionPos();
  }, [mention, mentionMatches.length, updateMentionPos]);

  useEffect(() => {
    if (!mention || mentionMatches.length === 0) return;
    const onScroll = () => updateMentionPos();
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (editorRef.current?.contains(target)) return;
      if (mentionRef.current?.contains(target)) return;
      setMention(null);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [mention, mentionMatches.length, updateMentionPos]);

  useEffect(() => {
    const onSelChange = () => {
      if (!editorRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.startContainer)) return;
      refreshMention();
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxLines = scope === "home" ? 10 : 16;

  const mentionDropdown =
    mention && mentionMatches.length > 0 && mentionPos && typeof document !== "undefined" ? (
      <div
        ref={mentionRef}
        className={`mention-dropdown mention-dropdown-${mentionPos.mode}`}
        style={
          mentionPos.mode === "down"
            ? { top: mentionPos.top, left: mentionPos.left, width: mentionPos.width }
            : { bottom: mentionPos.bottom, left: mentionPos.left, width: mentionPos.width }
        }
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="mention-hint">Прикрепить пост</div>
        {mentionMatches.map((p, i) => (
          <div
            key={p.id}
            className={`mention-item${i === mentionIndex ? " active" : ""}`}
            onMouseEnter={() => setMentionIndex(i)}
            onClick={() => pickMention(p)}
          >
            <span className="mention-item-body">
              <span className="mention-item-title">{truncate(attachmentPostTitle(p), 48)}</span>
              <span className="mention-item-meta">{postStatusLabel(p)}</span>
            </span>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div className="input-wrap" onMouseDown={onComposerShellMouseDown}>
      <div
        className="input-box"
        ref={inputBoxRef}
        style={{ ["--composer-max-lines" as string]: String(maxLines) }}
      >
        <div className="composer-field">
          <div
            ref={editorRef}
            className={`composer-editor${isEmpty ? " is-empty" : ""}`}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={effectivePlaceholder}
            data-placeholder={effectivePlaceholder}
            onInput={onEditorInput}
            onKeyDown={onKeyDown}
            onKeyUp={refreshMention}
            onClick={refreshMention}
            onPaste={onPaste}
          />
        </div>
        <div className="input-bottom">
          <div className="input-tools">
            <AttachMenu
              scope={scope}
              onAttach={addAttachmentInline}
              placement={placement}
              attachments={attachments}
            />
          </div>
          <div className="composer-mode">
            {!isMulti ? (
              <>
                <ModelPicker
                  ariaLabel="LLM модель"
                  className="composer-model-picker"
                  icon={<BrainIcon />}
                  value={target?.llmId || ""}
                  options={llmOptions.map((m) => ({
                    id: m.id,
                    label: `${m.provider} / ${m.model}`,
                  }))}
                  onChange={(id) => setComposerLlm(scope, id)}
                  disabled={llmOptions.length === 0}
                  placeholderLabel="Нет LLM моделей"
                  placement={placement}
                />
                <ModelPicker
                  ariaLabel="Web Search модель"
                  className="composer-model-picker"
                  icon={<SearchIcon />}
                  value={webValue}
                  options={webOptions.map((m) => ({
                    id: m.id,
                    label: formatWebSearchComposerLabel(m.provider, m.model),
                  }))}
                  onChange={(id) => setComposerWeb(scope, id)}
                  emptyValue=""
                  emptyLabel="Нет"
                  placement={placement}
                />
              </>
            ) : (
              <div className="model-picker is-static is-disabled">
                <div className="model-picker-btn" aria-disabled="true">
                  <span className="model-picker-icon"><BrainIcon /></span>
                  <span className="model-picker-label">Мультиответ</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <button className="send-btn" onClick={submit} type="button">
            ↑
          </button>
        </div>
      </div>
      {mentionDropdown && typeof document !== "undefined"
        ? createPortal(mentionDropdown, document.body)
        : null}
    </div>
  );
}
