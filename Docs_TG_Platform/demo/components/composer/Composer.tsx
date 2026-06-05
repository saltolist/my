"use client";

import { createPortal } from "react-dom";
import { useComposerEditor } from "@/lib/hooks/useComposerEditor";
import { onComposerShellMouseDown } from "@/lib/composerPointerDown";
import type { ComposerScope } from "@/lib/types";
import ComposerMentionDropdown from "./ComposerMentionDropdown";
import ComposerToolbar from "./ComposerToolbar";

type Props = {
  scope: ComposerScope;
  placeholder?: string;
  onSubmit: (text: string) => boolean;
};

export default function Composer({ scope, placeholder, onSubmit }: Props) {
  const editor = useComposerEditor({ scope, placeholder, onSubmit });

  const mentionDropdown =
    editor.mentionOpen && editor.mentionPos ? (
      <ComposerMentionDropdown
        mentionRef={editor.mentionRef}
        mentionPos={editor.mentionPos}
        matches={editor.mentionMatches}
        activeIndex={editor.mentionIndex}
        onHoverIndex={editor.setMentionIndex}
        onPick={editor.pickMention}
      />
    ) : null;

  return (
    <div className="input-wrap" onMouseDown={onComposerShellMouseDown}>
      <div className="composer-backdrop" aria-hidden="true" />
      <div
        className="input-box"
        ref={editor.inputBoxRef}
        style={{ ["--composer-max-lines" as string]: String(editor.maxLines) }}
      >
        <div className="composer-field">
          <div
            ref={editor.editorRef}
            className={`composer-editor${editor.isEmpty ? " is-empty" : ""}`}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={editor.effectivePlaceholder}
            data-placeholder={editor.effectivePlaceholder}
            onInput={editor.onEditorInput}
            onFocus={editor.normalizeEmptyEditorFocus}
            onKeyDown={editor.onKeyDown}
            onKeyUp={editor.refreshMention}
            onClick={() => {
              editor.normalizeEmptyEditorFocus();
              editor.refreshMention();
            }}
            onPaste={editor.onPaste}
          />
        </div>
        <ComposerToolbar
          scope={editor.scope}
          placement={editor.placement}
          attachments={editor.attachments}
          onAttach={editor.addAttachmentInline}
          isMulti={editor.isMulti}
          llmOptions={editor.llmOptions}
          webOptions={editor.webOptions}
          llmId={editor.llmId}
          webId={editor.webId}
          onLlmChange={(id) => editor.setComposerLlm(scope, id)}
          onWebChange={(id) => editor.setComposerWeb(scope, id)}
          onSubmit={editor.submit}
        />
      </div>
      {mentionDropdown && typeof document !== "undefined"
        ? createPortal(mentionDropdown, document.body)
        : null}
    </div>
  );
}
