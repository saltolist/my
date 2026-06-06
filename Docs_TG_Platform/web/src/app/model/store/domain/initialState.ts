import {
  initialAiProfileConfig,
  initialChannelProfileConfig,
  initialGlobalChats,
  initialGlobalNotes,
  initialPinnedPostIds,
  initialPosts,
  initialTelegramProfileConfig,
} from "@/shared/data/seed-data";
import type { DomainState } from "@/app/model/store/domain/types";

function buildInitialAiSnapshot() {
  return JSON.stringify({
    llmModels: initialAiProfileConfig.llmModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    webSearchModels: initialAiProfileConfig.webSearchModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: !!m.includeInMulti,
    })),
    orchestratorModels: initialAiProfileConfig.orchestratorModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    webReasonerModels: initialAiProfileConfig.webReasonerModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    ragReasonerModels: initialAiProfileConfig.ragReasonerModels.map((m) => ({
      provider: m.provider || "",
      model: m.model || "",
      apiKey: m.apiKey || "",
      active: !!m.active,
      includeInMulti: false,
    })),
    multiResponseEnabled: !!initialAiProfileConfig.multiResponseEnabled,
  });
}

function buildInitialTelegramSnapshot() {
  const cfg = initialTelegramProfileConfig;
  return JSON.stringify({
    apiId: cfg.apiId || "",
    apiHash: cfg.apiHash || "",
    phone: cfg.phone || "",
    sessionName: cfg.sessionName || "",
    channel: cfg.channel || "",
    botApiToken: cfg.botApiToken || "",
    botStatus: cfg.botStatus,
  });
}

export const initialDomainState: DomainState = {
  posts: initialPosts,
  globalChats: initialGlobalChats,
  globalNotes: initialGlobalNotes,
  channelProfileConfig: initialChannelProfileConfig,
  aiProfileConfig: initialAiProfileConfig,
  telegramProfileConfig: initialTelegramProfileConfig,
  pinnedPostIds: initialPinnedPostIds,
  composerTargets: {
    home: { llmId: "llm-1", webId: "web-1" },
    gchat: { llmId: "llm-1", webId: "web-1" },
    post: { llmId: "llm-1", webId: "web-1" },
  },
  systemPromptSavedSnapshot: initialAiProfileConfig.systemPrompt,
  modelSettingsSavedSnapshot: buildInitialAiSnapshot(),
  telegramSettingsSavedSnapshot: buildInitialTelegramSnapshot(),
  channelProfileSavedSnapshot: JSON.stringify(initialChannelProfileConfig),
};
