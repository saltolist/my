import { describe, expect, it, beforeEach } from "vitest";
import {
  clampScrollTop,
  getFeedScrollTop,
  markFeedSessionInitialScrollDone,
  resetFeedScrollSession,
  setFeedScrollTop,
  getFeedSessionDidInitialScroll,
} from "./feedScrollSession";

describe("feedScrollSession", () => {
  beforeEach(() => resetFeedScrollSession());

  it("stores scroll position", () => {
    setFeedScrollTop(120);
    expect(getFeedScrollTop()).toBe(120);
  });

  it("tracks initial scroll flag", () => {
    expect(getFeedSessionDidInitialScroll()).toBe(false);
    markFeedSessionInitialScrollDone();
    expect(getFeedSessionDidInitialScroll()).toBe(true);
  });

  it("clamps scroll top to valid range", () => {
    expect(clampScrollTop(500, 400, 100)).toBe(300);
    expect(clampScrollTop(50, 400, 100)).toBe(50);
  });
});
