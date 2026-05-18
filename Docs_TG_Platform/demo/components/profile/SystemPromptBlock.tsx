"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";

export default function SystemPromptBlock() {
  const { state, dispatch, setDirty } = useApp();
  const [draft, setDraft] = useState(state.aiProfileConfig.systemPrompt);
  const dirty = draft !== state.systemPromptSavedSnapshot;

  useEffect(() => {
    setDirty("profile-prompt", dirty);
  }, [dirty, setDirty]);

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
          className="profile-input profile-input-explicit profile-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
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
