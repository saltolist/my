import { describe, expect, it, vi } from "vitest";
import { syncDomainAction } from "@/app/model/store/domain/domainSync";
import { initialDomainState } from "@/app/model/store/domain/reducer";
import type { RepositoryBundle } from "@/shared/api/repositories";

function mockRepos(): RepositoryBundle {
  return {
    posts: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      reorder: vi.fn(),
      remove: vi.fn(),
    },
    chats: {
      listGlobal: vi.fn(),
      pushMessage: vi.fn(),
      rename: vi.fn(),
      remove: vi.fn(),
    },
    notes: {
      listGlobal: vi.fn(),
      upsert: vi.fn(),
      remove: vi.fn(),
    },
  };
}

describe("syncDomainAction", () => {
  it("syncs UPDATE_POST patch", async () => {
    const repos = mockRepos();
    await syncDomainAction(
      { type: "UPDATE_POST", postId: 1, patch: { text: "new" } },
      initialDomainState,
      initialDomainState,
      repos,
    );
    expect(repos.posts.update).toHaveBeenCalledWith(1, { text: "new" });
  });

  it("syncs UPSERT_GLOBAL_NOTE", async () => {
    const repos = mockRepos();
    const note = initialDomainState.globalNotes[0]!;
    await syncDomainAction(
      { type: "UPSERT_GLOBAL_NOTE", note },
      initialDomainState,
      initialDomainState,
      repos,
    );
    expect(repos.notes.upsert).toHaveBeenCalledWith(note);
  });

  it("syncs user message in PUSH_GLOBAL_CHAT", async () => {
    const repos = mockRepos();
    const chatId = initialDomainState.globalChats[0]!.id;
    await syncDomainAction(
      { type: "PUSH_GLOBAL_CHAT", chatId, message: { role: "user", text: "hi" } },
      initialDomainState,
      initialDomainState,
      repos,
    );
    expect(repos.chats.pushMessage).toHaveBeenCalledWith(chatId, "hi");
  });
});
