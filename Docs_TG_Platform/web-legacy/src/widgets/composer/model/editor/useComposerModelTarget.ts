"use client";

import { useMemo } from "react";
import {
  selectAiProfileConfig,
  selectComposerTarget,
  useComposer,
  useDomainSelector,
} from "@/app/model/store";
import { isWebSearchVisibleForLlm } from "@/shared/config/composer";
import type { ComposerScope } from "@/shared/types";

export function useComposerModelTarget(scope: ComposerScope) {
  const cfg = useDomainSelector(selectAiProfileConfig);
  const target = useDomainSelector(selectComposerTarget(scope));
  const { setComposerLlm, setComposerWeb } = useComposer();

  const llmOptions = cfg.llmModels.filter((m) => m.provider && m.model && m.active);
  const webOptionsAll = cfg.webSearchModels.filter((m) => m.provider && m.model && m.active);
  const selectedLlm = llmOptions.find((m) => m.id === target?.llmId);
  const webOptions = webOptionsAll.filter((m) => isWebSearchVisibleForLlm(m, selectedLlm));
  const webValue =
    target?.webId && webOptions.some((m) => m.id === target.webId) ? target.webId : "";

  return useMemo(
    () => ({
      llmOptions,
      webOptions,
      llmId: target?.llmId || "",
      webId: webValue,
      isMulti: cfg.multiResponseEnabled,
      setComposerLlm,
      setComposerWeb,
    }),
    [
      cfg.multiResponseEnabled,
      llmOptions,
      setComposerLlm,
      setComposerWeb,
      target?.llmId,
      webOptions,
      webValue,
    ],
  );
}
