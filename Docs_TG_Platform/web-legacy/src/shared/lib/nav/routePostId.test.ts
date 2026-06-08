import { describe, expect, it } from "vitest";
import { resolveRoutePostId } from "./routePostId";

describe("resolveRoutePostId", () => {
  it("prefers navigation state", () => {
    expect(resolveRoutePostId("/post/1/", 5)).toBe(5);
  });

  it("falls back to URL", () => {
    expect(resolveRoutePostId("/post/3/", null)).toBe(3);
  });
});
