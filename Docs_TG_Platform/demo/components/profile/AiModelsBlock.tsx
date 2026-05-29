"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";
import { LLM_PROVIDER_MODELS, WEB_SEARCH_PROVIDER_MODELS } from "@/lib/composer-config";
import type { AiProfileConfig, LlmModel } from "@/lib/types";
import ModelPicker, { BrainIcon, SearchIcon } from "@/components/composer/ModelPicker";
import MessageTrashIcon from "@/components/chat/MessageTrashIcon";
import ProfileCheckbox from "@/components/profile/ProfileCheckbox";
import { restoreAiConfigFromSnapshot } from "@/lib/profileDiscard";

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
  const setOrchestrators = (orchestratorModels: LlmModel[]) =>
    update({ ...cfg, orchestratorModels: normalizeExclusiveModels(orchestratorModels) });
  const setWebReasoners = (webReasonerModels: LlmModel[]) =>
    update({ ...cfg, webReasonerModels: normalizeExclusiveModels(webReasonerModels) });
  const setRagReasoners = (ragReasonerModels: LlmModel[]) =>
    update({ ...cfg, ragReasonerModels: normalizeExclusiveModels(ragReasonerModels) });

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
  const addOrchestrator = () =>
    setOrchestrators([
      ...cfg.orchestratorModels,
      { id: "orchestrator-" + Date.now(), provider: "", model: "", apiKey: "", active: false, includeInMulti: false },
    ]);
  const addWebReasoner = () =>
    setWebReasoners([
      ...cfg.webReasonerModels,
      { id: "web-reasoner-" + Date.now(), provider: "", model: "", apiKey: "", active: false, includeInMulti: false },
    ]);
  const addRagReasoner = () =>
    setRagReasoners([
      ...cfg.ragReasonerModels,
      { id: "rag-reasoner-" + Date.now(), provider: "", model: "", apiKey: "", active: false, includeInMulti: false },
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
      <div className="profile-row profile-row--after-models">
        <div className="profile-label profile-label--with-icon">
          <span className="profile-label-icon" aria-hidden>
            <BrainIcon />
          </span>
          Оркестратор
        </div>
      </div>
      <div className="profile-model-list">
        {cfg.orchestratorModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={LLM_PROVIDER_MODELS}
            canRemove={cfg.orchestratorModels.length > 1}
            showMultiToggle={false}
            onChange={(patch) =>
              setOrchestrators(updateExclusiveModel(cfg.orchestratorModels, idx, patch))
            }
            onRemove={() => setOrchestrators(cfg.orchestratorModels.filter((_, i) => i !== idx))}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addOrchestrator} type="button">
          Добавить модель оркестратора
        </button>
      </div>

      <div className="profile-ai-divider" />
      <div className="profile-row profile-row--after-models">
        <div className="profile-label profile-label--with-icon">
          <span className="profile-label-icon" aria-hidden>
            <SearchIcon />
          </span>
          Web Reasoner
        </div>
      </div>
      <div className="profile-model-list">
        {cfg.webReasonerModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={LLM_PROVIDER_MODELS}
            canRemove={cfg.webReasonerModels.length > 1}
            showMultiToggle={false}
            onChange={(patch) =>
              setWebReasoners(updateExclusiveModel(cfg.webReasonerModels, idx, patch))
            }
            onRemove={() => setWebReasoners(cfg.webReasonerModels.filter((_, i) => i !== idx))}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addWebReasoner} type="button">
          Добавить Web Reasoner
        </button>
      </div>

      <div className="profile-ai-divider" />
      <div className="profile-row profile-row--after-models">
        <div className="profile-label profile-label--with-icon">
          <span className="profile-label-icon" aria-hidden>
            <BrainIcon />
          </span>
          RAG Reasoner
        </div>
      </div>
      <div className="profile-model-list">
        {cfg.ragReasonerModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={LLM_PROVIDER_MODELS}
            canRemove={cfg.ragReasonerModels.length > 1}
            showMultiToggle={false}
            onChange={(patch) =>
              setRagReasoners(updateExclusiveModel(cfg.ragReasonerModels, idx, patch))
            }
            onRemove={() => setRagReasoners(cfg.ragReasonerModels.filter((_, i) => i !== idx))}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addRagReasoner} type="button">
          Добавить RAG Reasoner
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
  canRemove = false,
  showActiveToggle = true,
  showMultiToggle = true,
  onChange,
  onRemove,
}: {
  model: LlmModel;
  providerMap: Record<string, string[]>;
  canRemove?: boolean;
  showActiveToggle?: boolean;
  showMultiToggle?: boolean;
  onChange: (patch: Partial<LlmModel>) => void;
  onRemove?: () => void;
}) {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const hasProvider = !!model.provider;
  const providerOptions = Object.keys(providerMap).map((p) => ({ id: p, label: p }));
  const modelOptions = (providerMap[model.provider] || []).map((m) => ({ id: m, label: m }));
  return (
    <div className="profile-model-row">
      <div className="profile-model-pickers">
        <ModelPicker
          ariaLabel="Провайдер"
          className="profile-model-picker profile-model-provider"
          value={model.provider}
          options={providerOptions}
          placeholderLabel="Провайдер"
          placement="down"
          onChange={(provider) => {
            const next = provider ? providerMap[provider]?.[0] || "" : "";
            onChange({
              provider,
              model: next,
              apiKey: provider ? model.apiKey : "",
              active: provider ? model.active : false,
              includeInMulti: provider ? model.includeInMulti : false,
            });
          }}
        />
        <ModelPicker
          ariaLabel="Модель"
          className="profile-model-picker profile-model-name"
          value={model.model}
          options={modelOptions}
          disabled={!hasProvider}
          placeholderLabel="Выберите модель"
          placement="down"
          onChange={(value) => onChange({ model: value })}
        />
      </div>
      <div className="profile-model-key profile-model-key-wrap">
        <input
          className="profile-input profile-input-explicit profile-model-key-input"
          type={apiKeyVisible ? "text" : "password"}
          value={model.apiKey}
          placeholder="API key"
          disabled={!hasProvider}
          onChange={(e) => onChange({ apiKey: e.target.value })}
        />
        <button
          type="button"
          className="profile-api-key-toggle"
          disabled={!hasProvider}
          aria-label={apiKeyVisible ? "Скрыть API key" : "Показать API key"}
          title={apiKeyVisible ? "Скрыть API key" : "Показать API key"}
          onClick={() => setApiKeyVisible((value) => !value)}
        >
          <EyeIcon hidden={!apiKeyVisible} />
        </button>
      </div>
      <div className="profile-model-footer">
        <div className="profile-model-footer-checks">
          {showActiveToggle ? (
            <label className="profile-checkbox-label profile-model-multi">
              <ProfileCheckbox
                disabled={!hasProvider}
                checked={hasProvider && model.active}
                onChange={(e) => onChange({ active: e.target.checked })}
              />
              Активна
            </label>
          ) : null}
          {showMultiToggle ? (
            <label className="profile-checkbox-label profile-model-multi">
              <ProfileCheckbox
                disabled={!hasProvider}
                checked={hasProvider && model.includeInMulti}
                onChange={(e) => onChange({ includeInMulti: e.target.checked })}
              />
              В мультиответ
            </label>
          ) : null}
        </div>
        {onRemove ? (
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
        ) : null}
      </div>
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

function normalizeExclusiveModels(models: LlmModel[]): LlmModel[] {
  let activeSeen = false;
  return models.map((model) => {
    const active = !!model.active && !activeSeen;
    if (active) activeSeen = true;
    return { ...model, active, includeInMulti: false };
  });
}

function updateExclusiveModel(models: LlmModel[], idx: number, patch: Partial<LlmModel>): LlmModel[] {
  return models.map((model, i) => {
    if (i === idx) return { ...model, ...patch, includeInMulti: false };
    if (patch.active) return { ...model, active: false, includeInMulti: false };
    return { ...model, includeInMulti: false };
  });
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
  orchestratorModels: AiModelSnapshot[];
  webReasonerModels: AiModelSnapshot[];
  ragReasonerModels: AiModelSnapshot[];
  multiResponseEnabled: boolean;
};

function snapshotAiConfig(cfg: AiProfileConfig) {
  const modelSnapshot = (m: LlmModel): AiModelSnapshot => ({
    provider: m.provider || "",
    model: m.model || "",
    apiKey: m.apiKey || "",
    active: !!m.active,
    includeInMulti: !!m.includeInMulti,
  });

  return JSON.stringify({
    llmModels: cfg.llmModels.map(modelSnapshot),
    webSearchModels: cfg.webSearchModels.map(modelSnapshot),
    orchestratorModels: normalizeExclusiveModels(cfg.orchestratorModels).map(modelSnapshot),
    webReasonerModels: normalizeExclusiveModels(cfg.webReasonerModels).map(modelSnapshot),
    ragReasonerModels: normalizeExclusiveModels(cfg.ragReasonerModels).map(modelSnapshot),
    multiResponseEnabled: !!cfg.multiResponseEnabled,
  });
}

