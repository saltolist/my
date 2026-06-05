"use client";

import { useEffect } from "react";
import {
  normalizeExclusiveModels,
  snapshotAiConfig,
  updateExclusiveModel,
} from "@/lib/profile/aiModelsSnapshot";
import { restoreAiConfigFromSnapshot } from "@/lib/profileDiscard";
import { useComposer } from "@/state/composer-store";
import { useDomain } from "@/state/domain-store";
import { useUi } from "@/state/ui-store";
import type { AiProfileConfig, LlmModel } from "@/lib/types";

export function useAiModelsBlock() {
  const { state, dispatch, applyPatch } = useDomain();
  const { multiResponsePairs } = useComposer();
  const { setDirty } = useUi();
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
    applyPatch({ modelSettingsSavedSnapshot: currentSnapshot });
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

  return {
    cfg,
    dirty,
    multiEligible,
    multiResponsePairs,
    update,
    save,
    cancel,
    setLlms,
    setWebs,
    setOrchestrators,
    setWebReasoners,
    setRagReasoners,
    addLlm,
    addWeb,
    addOrchestrator,
    addWebReasoner,
    addRagReasoner,
    updateExclusiveModel,
  };
}
