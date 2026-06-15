import { describe, expect, it } from "vitest";

import { createPresentationMswStore } from "./presentation-seed";

describe("createPresentationMswStore", () => {
  const store = createPresentationMswStore();

  it("includes demo LLM and web search models for guests", () => {
    expect(store.aiProfile.llmModels.map((m) => `${m.provider}/${m.model}`)).toEqual([
      "OpenAI/gpt-4o",
      "Anthropic/claude-3-7-sonnet",
    ]);
    expect(store.aiProfile.webSearchModels.map((m) => `${m.provider}/${m.model}`)).toEqual([
      "Tavily/search-v1",
      "Exa/exa-neural",
      "OpenAI/responses-api-web-search",
    ]);
  });
});
