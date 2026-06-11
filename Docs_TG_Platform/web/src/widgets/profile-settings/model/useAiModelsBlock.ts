"use client";

import { useEffect } from "react";
import {
  normalizeExclusiveModels,
  snapshotAiConfig,
  updateExclusiveModel,
} from "@/shared/lib/profile/aiModelsSnapshot";
import { restoreAiConfigFromSnapshot } from "@/shared/lib/profileDiscard";
import { buildMultiResponsePairs } from "@/shared/config/composer";
import {
  domainActions,
  selectAiProfileConfig,
  selectModelSettingsSavedSnapshot,
  useDomainActions,
  useDomainDispatch,
  useDomainSelector,
  useUi,
} from "@/app/model/store";
import type { AiProfileConfig, LlmModel } from "@/shared/types";

export function useAiModelsBlock() {
  const cfg = useDomainSelector(selectAiProfileConfig);
  const modelSettingsSavedSnapshot = useDomainSelector(selectModelSettingsSavedSnapshot);
  const dispatch = useDomainDispatch();
  const { applyPatch } = useDomainActions();
  const { setDirty } = useUi();

  const update = (next: AiProfileConfig) => dispatch(domainActions.updateAiConfig(next));

  const multiResponsePairs = buildMultiResponsePairs(cfg.llmModels, cfg.webSearchModels);
  const pairCount = multiResponsePairs.length;
  const multiEligible = pairCount >= 2;

  const currentSnapshot = snapshotAiConfig(cfg);
  const dirty = currentSnapshot !== modelSettingsSavedSnapshot;

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
    update(restoreAiConfigFromSnapshot(cfg, modelSettingsSavedSnapshot));
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
