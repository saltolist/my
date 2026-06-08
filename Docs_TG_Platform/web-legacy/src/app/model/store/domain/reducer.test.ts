import { describe, expect, it } from "vitest";
import { domainReducer, initialDomainState } from "./reducer";
import { createSeedRepositories } from "@/shared/api/seedRepositories";

describe("domainReducer integration", () => {
  it("renames global chat", () => {
    const chatId = initialDomainState.globalChats[0]?.id;
    if (!chatId) return;
    const next = domainReducer(initialDomainState, {
      type: "RENAME_GLOBAL_CHAT",
      chatId,
      title: "New title",
    });
    expect(next.globalChats.find((c) => c.id === chatId)?.title).toBe("New title");
  });
});

describe("seedRepositories", () => {
  it("updates post via repository", async () => {
    const repos = createSeedRepositories();
    const posts = await repos.posts.list();
    const first = posts[0];
    if (!first) return;
    const updated = await repos.posts.update(first.id, { text: "repo-updated" });
    expect(updated.text).toBe("repo-updated");
  });
});
