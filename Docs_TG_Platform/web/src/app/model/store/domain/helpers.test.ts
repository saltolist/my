import { describe, expect, it } from "vitest";
import { patchGlobalChatHistory, withTelegramDomainSync } from "./helpers";
import { initialDomainState } from "./reducer";
import type { ChatMessage } from "@/shared/types";

describe("domain helpers", () => {
  it("patchGlobalChatHistory updates preview", () => {
    const domain = {
      ...initialDomainState,
      globalChats: [
        {
          ...initialDomainState.globalChats[0],
          id: "gc1",
          history: [{ role: "user" as const, text: "hello" }],
        },
      ],
    };
    const history: ChatMessage[] = [{ role: "user", text: "updated" }];
    const next = patchGlobalChatHistory(domain, "gc1", history);
    expect(next.globalChats[0].preview).toBe("updated");
    expect(next.globalChats[0].date).toBe("сейчас");
  });

  it("patchGlobalChatHistory returns same state for unknown chat", () => {
    const domain = initialDomainState;
    const next = patchGlobalChatHistory(domain, "missing", []);
    expect(next).toBe(domain);
  });

  it("withTelegramDomainSync returns config patch", () => {
    const domain = initialDomainState;
    const cfg = domain.telegramProfileConfig;
    const patch = withTelegramDomainSync(domain, cfg);
    expect(patch.telegramProfileConfig).toBeDefined();
    expect(patch.globalChats).toBeDefined();
  });
});
