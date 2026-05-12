export const LLM_PROVIDER_MODELS: Record<string, string[]> = {
  OpenAI: ["gpt-4o", "gpt-4.1", "gpt-4.1-mini"],
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
  Perplexity: ["sonar-pro", "sonar-reasoning"],
  Tavily: ["search-v1"],
  SerpAPI: ["google-search"],
  Exa: ["exa-neural"],
};

export const VARIANT_TAILS = [
  "Фокус: структурно и практично.",
  "Фокус: более разговорный тон.",
  "Фокус: кратко, без потери сути.",
  "Фокус: акцент на метриках и выводах.",
];
