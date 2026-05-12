"use client";

import { useEffect } from "react";
import { useApp } from "@/state/AppContext";
import { LLM_PROVIDER_MODELS, WEB_SEARCH_PROVIDER_MODELS } from "@/lib/composer-config";
import type { AiProfileConfig, LlmModel } from "@/lib/types";
import ModelPicker from "@/components/composer/ModelPicker";

export default function AiModelsBlock() {
  const { state, dispatch, multiResponsePairs, setDirty } = useApp();
  const cfg = state.aiProfileConfig;

  const update = (next: AiProfileConfig) => dispatch({ type: "UPDATE_AI_CONFIG", config: next });

  const llmEligible = cfg.llmModels.filter(
    (m) => m.provider && m.model && m.active && m.includeInMulti,
  ).length;
  const webEligible = cfg.webSearchModels.filter(
    (m) => m.provider && m.model && m.active && m.includeInMulti,
  ).length;
  const multiEligible = llmEligible >= 2 || (llmEligible >= 1 && webEligible >= 2);

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
    <div className="profile-section">
      <div className="profile-section-title">ИИ-движок</div>

      <div className="profile-row">
        <div className="profile-label">LLM-модели</div>
      </div>
      <div>
        {cfg.llmModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={LLM_PROVIDER_MODELS}
            onChange={(patch) =>
              setLlms(cfg.llmModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
            }
          />
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={addLlm} type="button">
        Добавить LLM модель
      </button>

      <div className="profile-row" style={{ marginTop: 14 }}>
        <div className="profile-label">Web Search модели</div>
      </div>
      <div>
        {cfg.webSearchModels.map((m, idx) => (
          <ModelRow
            key={m.id}
            model={m}
            providerMap={WEB_SEARCH_PROVIDER_MODELS}
            onChange={(patch) =>
              setWebs(cfg.webSearchModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
            }
          />
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={addWeb} type="button">
        Добавить Web Search модель
      </button>

      <div className="profile-row" style={{ marginTop: 14 }}>
        <div className="profile-label">Мультиответ</div>
        <label className="profile-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            disabled={!multiEligible}
            checked={cfg.multiResponseEnabled && multiEligible}
            onChange={(e) => update({ ...cfg, multiResponseEnabled: e.target.checked && multiEligible })}
          />
          <span className={!multiEligible ? "toggle-disabled-strike" : ""}>Включить</span>
        </label>
      </div>
      <div className="profile-val" style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
        При включенном мультиответе в поле ввода показывается один заблокированный режим.
        {multiEligible ? null : (
          <>
            {" "}
            Сейчас доступно пар: <b>{multiResponsePairs().length}</b>, нужно минимум 2.
          </>
        )}
      </div>
      <button
        className="btn btn-primary"
        disabled={!dirty}
        onClick={save}
        style={{ marginTop: 10 }}
        type="button"
      >
        Сохранить
      </button>
    </div>
  );
}

function ModelRow({
  model,
  providerMap,
  onChange,
}: {
  model: LlmModel;
  providerMap: Record<string, string[]>;
  onChange: (patch: Partial<LlmModel>) => void;
}) {
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
      <input
        className="profile-input profile-input-explicit profile-model-key"
        type="password"
        value={model.apiKey}
        placeholder="API key"
        onChange={(e) => onChange({ apiKey: e.target.value })}
        style={{ display: model.provider ? undefined : "none" }}
      />
      <label className="profile-val profile-model-multi">
        <input
          type="checkbox"
          checked={model.active}
          onChange={(e) =>
            onChange({ active: e.target.checked, includeInMulti: e.target.checked && model.includeInMulti })
          }
        />
        Активна
      </label>
      <label className="profile-val profile-model-multi">
        <input
          type="checkbox"
          checked={model.includeInMulti}
          onChange={(e) => onChange({ includeInMulti: e.target.checked })}
        />
        В мультиответ
      </label>
    </div>
  );
}

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
