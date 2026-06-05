"use client";

import { useState } from "react";
import ModelPicker from "@/shared/ui/model-picker/ui/ModelPicker";
import MessageTrashIcon from "@/entities/message/ui/MessageTrashIcon";
import ProfileCheckbox from "@/widgets/profile-settings/ui/ProfileCheckbox";
import ProfileEyeIcon from "@/widgets/profile-settings/ui/ProfileEyeIcon";
import type { LlmModel } from "@/shared/types";

type Props = {
  model: LlmModel;
  providerMap: Record<string, string[]>;
  canRemove?: boolean;
  showActiveToggle?: boolean;
  showMultiToggle?: boolean;
  onChange: (patch: Partial<LlmModel>) => void;
  onRemove?: () => void;
};

export default function AiModelRow({
  model,
  providerMap,
  canRemove = false,
  showActiveToggle = true,
  showMultiToggle = true,
  onChange,
  onRemove,
}: Props) {
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
          <ProfileEyeIcon hidden={!apiKeyVisible} />
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
            <span className="profile-model-remove-label">Удалить</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
