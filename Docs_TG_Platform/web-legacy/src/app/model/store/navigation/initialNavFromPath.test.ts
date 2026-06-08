import { describe, expect, it } from "vitest";
import { initialNavigationState } from "@/app/model/store/navigation/types";
import { initialNavFromPathname } from "./initialNavFromPath";

describe("initialNavFromPathname", () => {
  it("seeds post screen from URL", () => {
    const nav = initialNavFromPathname("/post/1/", "?chat=1001");
    expect(nav.screen).toBe("post");
    expect(nav.currentPostId).toBe(1);
    expect(nav.currentPostChatId).toBe(1001);
    expect(nav.postMode).toBe("chat");
  });

  it("returns default for home", () => {
    expect(initialNavFromPathname("/")).toEqual(initialNavigationState);
  });
});
