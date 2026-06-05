"use client";

import AiModelListSection from "@/widgets/profile-settings/ui/ai/AiModelListSection";
import ProfileCheckbox from "@/widgets/profile-settings/ui/ProfileCheckbox";
import { BrainIcon, SearchIcon } from "@/shared/ui/model-picker/ui/ModelPicker";
import { LLM_PROVIDER_MODELS, WEB_SEARCH_PROVIDER_MODELS } from "@/shared/config/composer";
import { useAiModelsBlock } from "@/widgets/profile-settings/model/useAiModelsBlock";

export default function AiModelsBlock() {
  const ai = useAiModelsBlock();
  const { cfg } = ai;

  return (
    <div className="profile-section profile-ai-engine-section">
      <div className="profile-section-title">ИИ-движок</div>

      <AiModelListSection
        icon={<BrainIcon />}
        title="LLM-модели"
        models={cfg.llmModels}
        providerMap={LLM_PROVIDER_MODELS}
        addLabel="Добавить LLM модель"
        showDivider={false}
        onModelChange={(idx, patch) =>
          ai.setLlms(cfg.llmModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
        }
        onModelRemove={(idx) => ai.setLlms(cfg.llmModels.filter((_, i) => i !== idx))}
        onAdd={ai.addLlm}
      />

      <AiModelListSection
        icon={<SearchIcon />}
        title="Web Search модели"
        models={cfg.webSearchModels}
        providerMap={WEB_SEARCH_PROVIDER_MODELS}
        addLabel="Добавить Web Search модель"
        onModelChange={(idx, patch) =>
          ai.setWebs(cfg.webSearchModels.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
        }
        onModelRemove={(idx) => ai.setWebs(cfg.webSearchModels.filter((_, i) => i !== idx))}
        onAdd={ai.addWeb}
      />

      <AiModelListSection
        icon={<BrainIcon />}
        title="Оркестратор"
        models={cfg.orchestratorModels}
        providerMap={LLM_PROVIDER_MODELS}
        addLabel="Добавить модель оркестратора"
        showMultiToggle={false}
        onModelChange={(idx, patch) =>
          ai.setOrchestrators(ai.updateExclusiveModel(cfg.orchestratorModels, idx, patch))
        }
        onModelRemove={(idx) => ai.setOrchestrators(cfg.orchestratorModels.filter((_, i) => i !== idx))}
        onAdd={ai.addOrchestrator}
      />

      <AiModelListSection
        icon={<SearchIcon />}
        title="Web Reasoner"
        models={cfg.webReasonerModels}
        providerMap={LLM_PROVIDER_MODELS}
        addLabel="Добавить Web Reasoner"
        showMultiToggle={false}
        onModelChange={(idx, patch) =>
          ai.setWebReasoners(ai.updateExclusiveModel(cfg.webReasonerModels, idx, patch))
        }
        onModelRemove={(idx) => ai.setWebReasoners(cfg.webReasonerModels.filter((_, i) => i !== idx))}
        onAdd={ai.addWebReasoner}
      />

      <AiModelListSection
        icon={<BrainIcon />}
        title="RAG Reasoner"
        models={cfg.ragReasonerModels}
        providerMap={LLM_PROVIDER_MODELS}
        addLabel="Добавить RAG Reasoner"
        showMultiToggle={false}
        onModelChange={(idx, patch) =>
          ai.setRagReasoners(ai.updateExclusiveModel(cfg.ragReasonerModels, idx, patch))
        }
        onModelRemove={(idx) => ai.setRagReasoners(cfg.ragReasonerModels.filter((_, i) => i !== idx))}
        onAdd={ai.addRagReasoner}
      />

      <div className="profile-ai-divider" />
      <div className="profile-multi-block profile-row--after-models">
        <div className="profile-label">Мультиответ</div>
        <label className="profile-checkbox-label profile-multi-toggle">
          <ProfileCheckbox
            disabled={!ai.multiEligible}
            checked={cfg.multiResponseEnabled && ai.multiEligible}
            onChange={(e) => ai.update({ ...cfg, multiResponseEnabled: e.target.checked && ai.multiEligible })}
          />
          <span className={!ai.multiEligible ? "toggle-disabled-strike" : ""}>Включить</span>
        </label>
        <div className="profile-val profile-ai-multi-hint">
          При включенном мультиответе в поле ввода показывается один заблокированный режим.
          {ai.multiEligible ? null : (
            <>
              {" "}
              Сейчас доступно пар: <b>{ai.multiResponsePairs().length}</b>, нужно минимум 2.
            </>
          )}
        </div>
      </div>
      <div className="profile-action-buttons profile-action-buttons--ai">
        <button className="btn btn-primary" disabled={!ai.dirty} onClick={ai.save} type="button">
          Сохранить
        </button>
        {ai.dirty ? (
          <button className="btn btn-ghost" onClick={ai.cancel} type="button">
            Отменить
          </button>
        ) : null}
      </div>
    </div>
  );
}
