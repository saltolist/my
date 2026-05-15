export const LLM_PROVIDER_MODELS: Record<string, string[]> = {
  OpenAI: ["gpt-4o", "gpt-4.1", "gpt-4.1-mini"],
  Perplexity: ["sonar", "sonar-pro"],
  Anthropic: ["claude-3-7-sonnet", "claude-3-5-sonnet"],
  Mistral: ["mistral-large", "mistral-small"],
  Google: ["gemini-1.5-pro", "gemini-1.5-flash"],
  DeepSeek: ["deepseek-chat", "deepseek-reasoner"],
  OpenRouter: [
    "meta-llama/llama-3.1-70b-instruct",
    "qwen/qwen-2.5-72b-instruct",
  ],
};

export const WEB_SEARCH_PROVIDER_MODELS: Record<string, string[]> = {
  Perplexity: ["search-api"],
  OpenAI: ["responses-api-web-search"],
  Tavily: ["search-v1"],
  SerpAPI: ["google-search"],
  Exa: ["exa-neural"],
};

export const OPENAI_WEB_SEARCH_MODEL = "responses-api-web-search";

export function isOpenAiWebSearchModel(provider: string, model: string): boolean {
  return provider === "OpenAI" && model === OPENAI_WEB_SEARCH_MODEL;
}

export function formatWebSearchComposerLabel(provider: string, model: string): string {
  if (isOpenAiWebSearchModel(provider, model)) {
    return `${provider} / responses-api + web search`;
  }
  return `${provider} / ${model}`;
}

export function isWebSearchVisibleForLlm(
  web: { provider: string; model: string },
  llm: { provider: string } | undefined,
): boolean {
  if (!isOpenAiWebSearchModel(web.provider, web.model)) return true;
  return llm?.provider === "OpenAI";
}

export const VARIANT_TAILS = [
  "Фокус: структурно и практично.",
  "Фокус: более разговорный тон.",
  "Фокус: кратко, без потери сути.",
  "Фокус: акцент на метриках и выводах.",
];
