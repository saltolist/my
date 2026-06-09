import { getGlobalReply, getPostReply } from "@/shared/lib/replies";

export type AiMessageScope = "home" | "gchat" | "post";

export type AiMessageContext = {
  scope: AiMessageScope;
  text: string;
  postId?: number;
};

export interface AiProvider {
  sendMessage(ctx: AiMessageContext): Promise<string>;
}

/** Stub AI provider — keyword-based replies until real SSE backend is wired. */
export function createStubAiProvider(): AiProvider {
  return {
    async sendMessage(ctx) {
      if (ctx.scope === "post") return getPostReply(ctx.text);
      return getGlobalReply(ctx.text);
    },
  };
}

let defaultProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!defaultProvider) defaultProvider = createStubAiProvider();
  return defaultProvider;
}

/** For tests — inject or reset the default provider. */
export function setAiProviderForTests(provider: AiProvider | null): void {
  defaultProvider = provider;
}
