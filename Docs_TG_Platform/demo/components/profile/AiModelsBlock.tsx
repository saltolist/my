"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";
import { LLM_PROVIDER_MODELS, WEB_SEARCH_PROVIDER_MODELS } from "@/lib/composer-config";
import type { AiProfileConfig, LlmModel } from "@/lib/types";
import ModelPicker, { BrainIcon, SearchIcon } from "@/components/composer/ModelPicker";
import MessageTrashIcon from "@/components/chat/MessageTrashIcon";
import ProfileCheckbox from "@/components/profile/ProfileCheckbox";

export default function AiModelsBlock() {
  const { state, dispatch, multiResponsePairs, setDirty } = useApp();
  const cfg = state.aiProfileConfig;

  const update = (next: AiProfileConfig) => dispatch({ type: "UPDATE_AI_CONFIG", config: next });

  const pairCount = multiResponsePairs().length;
  const multiEligible = pairCount >= 2;

  const currentSnapshot = snapshotAiConfig(cfg);
  const dirty = currentSnapshot !== state.modelSettingsSavedSnapshot;

  useEffect(() => {
    setDirty("profile-ai", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => setDirty("profile-ai", false);
  }, [setDirty]);

  const save = () => {
    if (!dirty) return;
    dispatch({ type: "SET_STATE", patch: { modelSettingsSavedSnapshot: currentSnapshot } });
  };

  const cancel = () => {
    if (!dirty) return;
    update(restoreAiConfigFromSnapshot(cfg, state.modelSettingsSavedSnapshot));
  };

  const setLlms = (llmModels: LlmModel[]) => update({ ...cfg, llmModels });
  const setWebs = (webSearchModels: LlmModel[]) => update({ ...cfg, webSearchModels });

  const addLlm = () =>
    setLlms([
      ...cfg.llmModels,
      { id: "llm-" + Date.now(), provider: "", model: "", apiKey: "", active: true, includeInMulti: false },
    ]);
  const addWeb = () =>
    setWebs([
      ...cfg.webSearchModels,
      { id: "web-" + Date.now(), provider: "", model: "", apiKey: "", active: true, includeInMulti: false },
    ]);
  return (
    <div className="profile-section profile-ai-engine-section">
      <div className="profile-section-title">ИИ-движок</div>

      <div className="profile-row">
        <div className="profile-label profile-label--with-icon">
          <span className="profile-label-icon" aria-hidden>
            <BrainIcon />
          </span>
          LLM-модели
        </div>
      </div>
      <div className="profile-model-list">
        {cfg.llmModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={LLM_PROVIDER_MODELS}
            canRemove={cfg.llmModels.length > 1}
            onChange={(patch) =>
              setLlms(cfg.llmModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
            }
            onRemove={() => setLlms(cfg.llmModels.filter((_, i) => i !== idx))}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addLlm} type="button">
          Добавить LLM модель
        </button>
      </div>

      <div className="profile-ai-divider" />
      <div className="profile-row profile-row--after-models">
        <div className="profile-label profile-label--with-icon">
          <span className="profile-label-icon" aria-hidden>
            <SearchIcon />
          </span>
          Web Search модели
        </div>
      </div>
      <div className="profile-model-list">
        {cfg.webSearchModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={WEB_SEARCH_PROVIDER_MODELS}
            canRemove={cfg.webSearchModels.length > 1}
            onChange={(patch) =>
              setWebs(cfg.webSearchModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
            }
            onRemove={() => setWebs(cfg.webSearchModels.filter((_, i) => i !== idx))}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addWeb} type="button">
          Добавить Web Search модель
        </button>
      </div>

      <div className="profile-ai-divider" />
      <div className="profile-multi-block profile-row--after-models">
        <div className="profile-label">Мультиответ</div>
        <label className="profile-checkbox-label profile-multi-toggle">
          <ProfileCheckbox
            disabled={!multiEligible}
            checked={cfg.multiResponseEnabled && multiEligible}
            onChange={(e) => update({ ...cfg, multiResponseEnabled: e.target.checked && multiEligible })}
          />
          <span className={!multiEligible ? "toggle-disabled-strike" : ""}>Включить</span>
        </label>
        <div className="profile-val profile-ai-multi-hint">
          При включенном мультиответе в поле ввода показывается один заблокированный режим.
          {multiEligible ? null : (
            <>
              {" "}
              Сейчас доступно пар: <b>{multiResponsePairs().length}</b>, нужно минимум 2.
            </>
          )}
        </div>
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

function ModelRow({
  model,
  providerMap,
  canRemove,
  onChange,
  onRemove,
}: {
  model: LlmModel;
  providerMap: Record<string, string[]>;
  canRemove: boolean;
  onChange: (patch: Partial<LlmModel>) => void;
  onRemove: () => void;
}) {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const providerOptions = Object.keys(providerMap).map((p) => ({ id: p, label: p }));
  const modelOptions = (providerMap[model.provider] || []).map((m) => ({ id: m, label: m }));
  return (
    <div className="profile-model-row">
      <ModelPicker
        ariaLabel="Провайдер"
        className="profile-model-picker profile-model-provider"
        value={model.provider}
        options={providerOptions}
        placeholderLabel="Выберите провайдера"
        placement="down"
        onChange={(provider) => {
          const next = provider ? providerMap[provider]?.[0] || "" : "";
          onChange({ provider, model: next, apiKey: provider ? model.apiKey : "" });
        }}
      />
      <ModelPicker
        ariaLabel="Модель"
        className="profile-model-picker profile-model-name"
        value={model.model}
        options={modelOptions}
        disabled={!model.provider}
        placeholderLabel="Выберите модель"
        placement="down"
        onChange={(value) => onChange({ model: value })}
      />
      <div
        className="profile-model-key profile-model-key-wrap"
        style={{ display: model.provider ? undefined : "none" }}
      >
        <input
          className="profile-input profile-input-explicit profile-model-key-input"
          type={apiKeyVisible ? "text" : "password"}
          value={model.apiKey}
          placeholder="API key"
          onChange={(e) => onChange({ apiKey: e.target.value })}
        />
        <button
          type="button"
          className="profile-api-key-toggle"
          aria-label={apiKeyVisible ? "Скрыть API key" : "Показать API key"}
          title={apiKeyVisible ? "Скрыть API key" : "Показать API key"}
          onClick={() => setApiKeyVisible((value) => !value)}
        >
          <EyeIcon hidden={!apiKeyVisible} />
        </button>
      </div>
      <label className="profile-checkbox-label profile-model-multi">
        <ProfileCheckbox
          checked={model.active}
          onChange={(e) =>
            onChange({ active: e.target.checked, includeInMulti: e.target.checked && model.includeInMulti })
          }
        />
        Активна
      </label>
      <label className="profile-checkbox-label profile-model-multi">
        <ProfileCheckbox
          checked={model.includeInMulti}
          onChange={(e) => onChange({ includeInMulti: e.target.checked })}
        />
        В мультиответ
      </label>
      <button
        type="button"
        className="profile-model-remove"
        disabled={!canRemove}
        aria-label="Удалить модель"
        title={canRemove ? "Удалить модель" : "Нельзя удалить последнюю модель"}
        onClick={() => {
          const label = model.model || model.provider || "модель";
          if (!window.confirm(`Удалить модель «${label}»?`)) return;
          onRemove();
        }}
      >
        <MessageTrashIcon />
      </button>
    </div>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      className="profile-api-key-toggle-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
      {hidden ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

type AiModelSnapshot = {
  provider: string;
  model: string;
  apiKey: string;
  active: boolean;
  includeInMulti: boolean;
};

type AiSettingsSnapshot = {
  llmModels: AiModelSnapshot[];
  webSearchModels: AiModelSnapshot[];
  multiResponseEnabled: boolean;
};

function snapshotAiConfig(cfg: AiProfileConfig) {
  return JSON.stringify({
    llmModels: cfg.llmModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    webSearchModels: cfg.webSearchModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    multiResponseEnabled: !!cfg.multiResponseEnabled,
  });
}

function restoreAiConfigFromSnapshot(current: AiProfileConfig, snapshotJson: string): AiProfileConfig {
  const saved = JSON.parse(snapshotJson) as AiSettingsSnapshot;
  const mapModels = (
    currentModels: LlmModel[],
    savedModels: AiModelSnapshot[],
    idPrefix: string,
  ): LlmModel[] =>
    savedModels.map((row, i) => ({
      id: currentModels[i]?.id ?? `${idPrefix}-${Date.now()}-${i}`,
      provider: row.provider,
      model: row.model,
      apiKey: row.apiKey,
      active: row.active,
      includeInMulti: row.includeInMulti,
    }));

  return {
    ...current,
    llmModels: mapModels(current.llmModels, saved.llmModels, "llm"),
    webSearchModels: mapModels(current.webSearchModels, saved.webSearchModels, "web"),
    multiResponseEnabled: saved.multiResponseEnabled,
  };
}
