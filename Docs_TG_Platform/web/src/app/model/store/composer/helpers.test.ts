import { describe, expect, it } from "vitest";

import {
  buildAiReplyMessage,
  getChatSendValidationMessage,
  getLlmSendValidationMessage,
  getOrchestratorSendValidationMessage,
} from "@/app/model/store/composer/helpers";
import { initialAiProfileConfig } from "@/shared/data/seed-data";
import type { AiProfileConfig } from "@/shared/types";

function multiCfg(overrides?: Partial<AiProfileConfig>): AiProfileConfig {
  return {
    ...initialAiProfileConfig,
    multiResponseEnabled: true,
    llmModels: initialAiProfileConfig.llmModels.map((m) =>
      m.id === "llm-2" ? { ...m, includeInMulti: true } : m,
    ),
    ...overrides,
  };
}

describe("buildAiReplyMessage", () => {
  it("builds multi-variant reply when multiResponseEnabled", () => {
    const cfg = multiCfg();
    const reply = buildAiReplyMessage(cfg, "Ответ", "gchat", { llmId: "llm-1", webId: "web-1" });

    expect(reply.role).toBe("ai");
    expect(reply.mode).toBe("multi");
    expect(reply.variants?.length).toBeGreaterThanOrEqual(2);
    expect(reply.selectedVariant).toBe(0);
    expect(reply.variants?.[0]?.text).toContain("Ответ");
  });

  it("builds single reply when multiResponseEnabled is off", () => {
    const cfg = { ...initialAiProfileConfig, multiResponseEnabled: false };
    const reply = buildAiReplyMessage(cfg, "Ответ", "gchat", { llmId: "llm-1", webId: "web-1" });

    expect(reply.mode).toBe("single");
    expect(reply.text).toContain("Ответ");
    expect(reply.variants).toBeUndefined();
  });
});

describe("chat send validation", () => {
  it("asks to add LLM when none configured", () => {
    const cfg = { ...initialAiProfileConfig, llmModels: [], orchestratorModels: [] };
    expect(getLlmSendValidationMessage(cfg, "gchat", "")).toBe("Добавьте LLM модель.");
  });

  it("asks to activate LLM when configured but inactive", () => {
    const cfg = {
      ...initialAiProfileConfig,
      multiResponseEnabled: false,
      llmModels: [
        {
          id: "llm-1",
          provider: "OpenAI",
          model: "gpt-4o",
          apiKey: "",
          active: false,
          includeInMulti: false,
        },
      ],
    };
    expect(getLlmSendValidationMessage(cfg, "gchat", "llm-1")).toBe("Активируйте LLM модель.");
  });

  it("passes when active LLM exists but composer target is empty", () => {
    const cfg = {
      ...initialAiProfileConfig,
      multiResponseEnabled: false,
      llmModels: [
        {
          id: "llm-1",
          provider: "OpenAI",
          model: "gpt-4o",
          apiKey: "",
          active: true,
          includeInMulti: false,
        },
      ],
    };
    expect(getLlmSendValidationMessage(cfg, "gchat", "")).toBeNull();
  });

  it("passes when active LLM exists but composer target is stale", () => {
    const cfg = {
      ...initialAiProfileConfig,
      multiResponseEnabled: false,
      llmModels: [
        {
          id: "llm-new",
          provider: "OpenAI",
          model: "gpt-4o",
          apiKey: "",
          active: true,
          includeInMulti: false,
        },
      ],
    };
    expect(getLlmSendValidationMessage(cfg, "gchat", "llm-old")).toBeNull();
  });

  it("asks to include LLM in multi-response when active but not selected for multi", () => {
    const cfg = {
      ...initialAiProfileConfig,
      multiResponseEnabled: true,
      llmModels: [
        {
          id: "llm-1",
          provider: "OpenAI",
          model: "gpt-4o",
          apiKey: "",
          active: true,
          includeInMulti: false,
        },
      ],
    };
    expect(getLlmSendValidationMessage(cfg, "gchat", "")).toBe("Включите LLM модели в мультиответ.");
  });

  it("asks to add orchestrator when list is empty", () => {
    const cfg = { ...initialAiProfileConfig, orchestratorModels: [] };
    expect(getOrchestratorSendValidationMessage(cfg)).toBe("Добавьте модель оркестратора.");
  });

  it("asks to activate orchestrator when configured but inactive", () => {
    const cfg = {
      ...initialAiProfileConfig,
      orchestratorModels: [
        {
          id: "orchestrator-1",
          provider: "OpenAI",
          model: "gpt-4o",
          apiKey: "",
          active: false,
          includeInMulti: false,
        },
      ],
    };
    expect(getOrchestratorSendValidationMessage(cfg)).toBe("Активируйте модель оркестратора.");
  });

  it("checks only LLM and orchestrator, not web or rag reasoners", () => {
    const cfg = {
      ...initialAiProfileConfig,
      orchestratorModels: [],
      webReasonerModels: [],
      ragReasonerModels: [],
    };
    expect(getChatSendValidationMessage(cfg, "gchat", "llm-1")).toBe("Добавьте модель оркестратора.");
  });

  it("prioritizes LLM message before orchestrator", () => {
    const cfg = {
      ...initialAiProfileConfig,
      llmModels: [],
      orchestratorModels: [],
    };
    expect(getChatSendValidationMessage(cfg, "gchat", "")).toBe("Добавьте LLM модель.");
  });
});
