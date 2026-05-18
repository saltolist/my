"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";

export default function SystemPromptBlock() {
  const { state, dispatch, setDirty } = useApp();
  const [draft, setDraft] = useState(state.aiProfileConfig.systemPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dirty = draft !== state.systemPromptSavedSnapshot;

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };

  useEffect(() => {
    setDirty("profile-prompt", dirty);
  }, [dirty, setDirty]);

  useLayoutEffect(() => {
    resize();
  }, [draft]);

  useEffect(() => {
    return () => setDirty("profile-prompt", false);
  }, [setDirty]);

  const save = () => {
    if (!dirty) return;
    dispatch({
      type: "UPDATE_AI_CONFIG",
      config: { ...state.aiProfileConfig, systemPrompt: draft },
    });
    dispatch({ type: "SET_STATE", patch: { systemPromptSavedSnapshot: draft } });
  };

  const cancel = () => {
    if (!dirty) return;
    setDraft(state.systemPromptSavedSnapshot);
  };

  return (
    <div className="profile-section">
      <div className="profile-section-title">Системный промпт</div>
      <div className="profile-row">
        <textarea
          ref={textareaRef}
          className="profile-input profile-input-explicit profile-textarea profile-system-prompt-textarea"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            requestAnimationFrame(resize);
          }}
        />
      </div>
      <div className="profile-action-buttons profile-action-buttons--ai">
        <button className="btn btn-primary" disabled={!dirty} onClick={save} type="button">
          Сохранить
        </button>
        {dirty ? (
          <button className="btn btn-ghost" onClick={cancel} type="button">
            Отменить
          </button>
        ) : null}
      </div>
    </div>
  );
}
