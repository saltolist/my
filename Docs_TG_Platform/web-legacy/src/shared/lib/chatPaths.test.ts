import { describe, expect, it } from "vitest";
import {
  clampActiveBranchIndex,
  displayUserText,
  resolveMessage,
} from "./chatPaths";
import type { ChatMessage } from "@/shared/types";

describe("chatPaths", () => {
  const branched: ChatMessage = {
    role: "user",
    userBranches: [
      { text: "first", continuation: [] },
      { text: "second", continuation: [] },
    ],
    activeUserBranch: 1,
  };

  it("clampActiveBranchIndex", () => {
    expect(clampActiveBranchIndex(branched)).toBe(1);
    expect(clampActiveBranchIndex({ role: "user", text: "plain" })).toBe(0);
  });

  it("displayUserText uses active branch", () => {
    expect(displayUserText(branched)).toBe("second");
    expect(displayUserText({ role: "user", text: "plain" })).toBe("plain");
    expect(displayUserText({ role: "ai", text: "x" })).toBe("");
  });

  it("resolveMessage at root", () => {
    const history: ChatMessage[] = [{ role: "user", text: "hi" }];
    expect(resolveMessage(history, [0])?.text).toBe("hi");
    expect(resolveMessage(history, [1])).toBeNull();
  });
});
