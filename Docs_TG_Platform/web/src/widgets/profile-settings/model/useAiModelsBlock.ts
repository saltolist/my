"use client";

import { useCallback, useEffect } from "react";
import {
  normalizeExclusiveModels,
  snapshotAiConfig,
  updateExclusiveModel,
} from "@/shared/lib/profile/aiModelsSnapshot";
import { registerAiModelsAutosaveFlush } from "@/shared/lib/profile/aiModelsAutosave";
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
import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";
import { useUpdateAiProfile } from "@/entities/channel";
import type { AiProfileConfig, LlmModel } from "@/shared/types";

export function useAiModelsBlock() {
  const cfg = useDomainSelector(selectAiProfileConfig);
  const modelSettingsSavedSnapshot = useDomainSelector(selectModelSettingsSavedSnapshot);
  const dispatch = useDomainDispatch();
  const { applyPatch } = useDomainActions();
  const { setDirty } = useUi();
  const updateAiProfile = useUpdateAiProfile();

  const update = (next: AiProfileConfig) => dispatch(domainActions.updateAiConfig(next));

  const multiResponsePairs = buildMultiResponsePairs(cfg.llmModels, cfg.webSearchModels);
  const pairCount = multiResponsePairs.length;
  const multiEligible = pairCount >= 2;

  const currentSnapshot = snapshotAiConfig(cfg);
  const dirty = currentSnapshot !== modelSettingsSavedSnapshot;

  const flushSave = useCallback(async () => {
    const state = useProfileDraftStore.getState();
    const nextCfg = state.aiProfileConfig;
    const snapshot = snapshotAiConfig(nextCfg);
    if (snapshot === state.modelSettingsSavedSnapshot) return;
    state.applyPatch({ modelSettingsSavedSnapshot: snapshot });
    await updateAiProfile.mutateAsync(nextCfg);
  }, [updateAiProfile]);

  useEffect(() => {
    setDirty("profile-ai", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    registerAiModelsAutosaveFlush(flushSave);
    return () => {
      registerAiModelsAutosaveFlush(null);
      void flushSave();
      setDirty("profile-ai", false);
    };
  }, [flushSave, setDirty]);

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
    multiEligible,
    multiResponsePairs,
    update,
    flushSave,
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
