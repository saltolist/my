import {
  buildMultiResponsePairs,
  formatWebSearchComposerLabel,
  isOpenAiWebSearchModel,
  isWebSearchVisibleForLlm,
  VARIANT_TAILS,
} from "@/lib/composer-config";
import type { DomainState } from "@/state/domain/types";
import type { AiVariant, ChatMessage, ComposerScope } from "@/lib/types";

export function resolveLlmLabel(
  domain: DomainState,
  id: string,
): string {
  const model = domain.aiProfileConfig.llmModels.find((m) => m.id === id);
  return model ? `${model.provider} / ${model.model || "модель"}` : "LLM не выбрана";
}

export function resolveWebLabel(
  domain: DomainState,
  id: string,
): string {
  if (!id) return "Нет";
  const model = domain.aiProfileConfig.webSearchModels.find((m) => m.id === id);
  return model
    ? formatWebSearchComposerLabel(model.provider, model.model || "модель")
    : "Нет";
}

export function resolveMultiResponsePairs(domain: DomainState) {
  return buildMultiResponsePairs(
    domain.aiProfileConfig.llmModels,
    domain.aiProfileConfig.webSearchModels,
  );
}

export function hasLlmForComposerScope(
  domain: DomainState,
  scope: ComposerScope,
): boolean {
  const cfg = domain.aiProfileConfig;
  if (cfg.multiResponseEnabled) {
    return cfg.llmModels.some(
      (m) => m.provider && m.model && m.active && m.includeInMulti,
    );
  }
  const target = domain.composerTargets[scope];
  if (!target?.llmId) return false;
  return cfg.llmModels.some(
    (m) => m.id === target.llmId && m.provider && m.model && m.active,
  );
}

export function buildComposerTargetPatch(
  domain: DomainState,
  scope: ComposerScope,
  llmId: string,
): Partial<DomainState> {
  const prev = domain.composerTargets[scope];
  let webId = prev.webId;
  const llm = domain.aiProfileConfig.llmModels.find((m) => m.id === llmId);
  const web = domain.aiProfileConfig.webSearchModels.find((m) => m.id === webId);
  if (
    web &&
    isOpenAiWebSearchModel(web.provider, web.model) &&
    !isWebSearchVisibleForLlm(web, llm)
  ) {
    webId = "";
  }
  return {
    composerTargets: {
      ...domain.composerTargets,
      [scope]: { ...prev, llmId, webId },
    },
  };
}

export function buildComposerWebPatch(
  domain: DomainState,
  scope: ComposerScope,
  webId: string,
): Partial<DomainState> {
  return {
    composerTargets: {
      ...domain.composerTargets,
      [scope]: { ...domain.composerTargets[scope], webId },
    },
  };
}

export function buildAiReplyMessage(
  domain: DomainState,
  baseReply: string,
  scope: ComposerScope,
): ChatMessage {
  const cfg = domain.aiProfileConfig;
  if (cfg.multiResponseEnabled) {
    const pairs = resolveMultiResponsePairs(domain);
    if (pairs.length > 0) {
      const variants: AiVariant[] = pairs.map((pair, idx) => {
        const llmModel = cfg.llmModels.find((m) => m.id === pair.llmId);
        const webModel = pair.webId
          ? cfg.webSearchModels.find((m) => m.id === pair.webId)
          : undefined;
        const llmCap = llmModel ? `${llmModel.provider}/${llmModel.model}` : "";
        const webCap = webModel
          ? formatWebSearchComposerLabel(webModel.provider, webModel.model)
          : "";
        const label = webCap ? `${llmCap} + ${webCap}` : llmCap;
        return {
          key: pair.id,
          label,
          llmCaption: llmCap,
          webCaption: webCap || undefined,
          text: `${baseReply}\n\n— ${label}\n${VARIANT_TAILS[idx % VARIANT_TAILS.length]}`,
        };
      });
      return { role: "ai", variants, selectedVariant: 0, mode: "multi" };
    }
  }
  const target = domain.composerTargets[scope];
  const llm = resolveLlmLabel(domain, target?.llmId || "");
  const web = resolveWebLabel(domain, target?.webId || "");
  const label = target?.webId ? `${llm} + ${web}` : llm;
  return {
    role: "ai",
    text: `${baseReply}\n\n— ${label}\n${VARIANT_TAILS[0]}`,
    mode: "single",
    targetLabel: label,
    llmLabel: llm,
    webLabel: web,
  };
}
