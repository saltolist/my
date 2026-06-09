import { describe, expect, it } from "vitest";

import { isPathActive, routes, screenFromPath } from "./routes";

describe("routes", () => {
  it("maps top-level paths to screens", () => {
    expect(screenFromPath("/")).toBe("home");
    expect(screenFromPath("/feed/")).toBe("feed");
    expect(screenFromPath("/profile")).toBe("profile");
  });

  it("builds canonical hrefs", () => {
    expect(routes.feed()).toBe("/feed/");
    expect(routes.notes()).toBe("/notes/");
  });

  it("checks active path", () => {
    expect(isPathActive("/feed/", "/feed/")).toBe(true);
    expect(isPathActive("/feed", "/feed/")).toBe(true);
    expect(isPathActive("/notes/", "/feed/")).toBe(false);
  });
});
