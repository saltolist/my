import { describe, expect, it } from "vitest";
import {
  buildRoutePatch,
  canPathGoBack,
  getParentPath,
  parseAppPath,
  parseChatSearchParam,
  parseGChatLegacyPath,
  parsePostLegacySub,
  routes,
  screenFromPath,
} from "./routes";

describe("parseAppPath", () => {
  it("parses top-level screens", () => {
    expect(parseAppPath("/feed/").screen).toBe("feed");
    expect(parseAppPath("/chats/").screen).toBe("chats");
    expect(parseAppPath("/notes/").screen).toBe("notes");
    expect(parseAppPath("/analytics/").screen).toBe("analytics");
    expect(parseAppPath("/profile/").screen).toBe("profile");
  });

  it("parses post and note routes", () => {
    expect(parseAppPath("/post/42/")).toMatchObject({ screen: "post", postId: 42 });
    expect(parseAppPath("/note/global/gn1/")).toMatchObject({
      screen: "note",
      noteGlobalId: "gn1",
    });
    expect(parseAppPath("/note/post/3/7/")).toMatchObject({
      screen: "note",
      notePostId: 3,
      noteId: 7,
    });
  });

  it("parses gchat legacy path segment", () => {
    expect(parseAppPath("/gchat/gc1/")).toMatchObject({ screen: "gchat", gchatId: "gc1" });
  });
});

describe("legacy parsers", () => {
  it("parsePostLegacySub", () => {
    expect(parsePostLegacySub("/post/5/notes/")).toEqual({ postId: 5, mode: "notes" });
    expect(parsePostLegacySub("/post/new/notes/")).toBeNull();
  });

  it("parseGChatLegacyPath", () => {
    expect(parseGChatLegacyPath("/gchat/gc1/")).toBe("gc1");
    expect(parseGChatLegacyPath("/gchat/")).toBeNull();
  });

  it("parseChatSearchParam", () => {
    expect(parseChatSearchParam("3")).toBe(3);
    expect(parseChatSearchParam("0")).toBeNull();
    expect(parseChatSearchParam(null)).toBeNull();
  });
});

describe("navigation helpers", () => {
  it("screenFromPath", () => {
    expect(screenFromPath("/feed/")).toBe("feed");
  });

  it("getParentPath and canPathGoBack", () => {
    expect(getParentPath("/post/5/")).toBe("/feed/");
    expect(canPathGoBack("/post/5/")).toBe(true);
    expect(canPathGoBack("/feed/")).toBe(true);
    expect(canPathGoBack("/")).toBe(false);
  });

  it("routes.post with chat query", () => {
    expect(routes.post(1, 2)).toBe("/post/1/?chat=2");
  });
});

describe("buildRoutePatch", () => {
  it("returns gchat patch", () => {
    const patch = buildRoutePatch(
      { ...parseAppPath("/gchat/"), gchatId: "gc1", screen: "gchat" },
      { posts: [], globalChats: [], globalNotes: [] },
      null,
    );
    expect(patch.currentGChatId).toBe("gc1");
  });
});
