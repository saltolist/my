import { describe, expect, it } from "vitest";
import { isFeedPath } from "./isFeedPath";

describe("isFeedPath", () => {
  it("detects feed routes", () => {
    expect(isFeedPath("/feed")).toBe(true);
    expect(isFeedPath("/feed/")).toBe(true);
    expect(isFeedPath("/notes")).toBe(false);
    expect(isFeedPath("/")).toBe(false);
  });
});
