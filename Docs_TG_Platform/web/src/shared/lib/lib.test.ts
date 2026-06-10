import { describe, expect, it } from "vitest";
import { postStatusSchema } from "@/shared/api/schemas/post";
import { getGlobalReply, getPostReply } from "@/shared/lib/replies";
import {
  parseAppPath,
  parseGChatLegacyPath,
  parsePostLegacySub,
  getParentPath,
  statePatchToHref,
  routes,
} from "@/shared/lib/routes";

describe("routes", () => {
  it("parses feed path", () => {
    expect(parseAppPath("/feed/").screen).toBe("feed");
  });

  it("parses post path", () => {
    const parsed = parseAppPath("/post/1/");
    expect(parsed.screen).toBe("post");
    expect(parsed.postId).toBe(1);
  });

  it("parses gchat path", () => {
    expect(parseAppPath("/gchat/").screen).toBe("gchat");
  });

  it("parses note global path", () => {
    const parsed = parseAppPath("/note/global/gn1/");
    expect(parsed.screen).toBe("note");
    expect(parsed.noteGlobalId).toBe("gn1");
  });

  it("builds gchat href", () => {
    expect(routes.gchat("gc1")).toBe("/gchat/?id=gc1");
  });

  it("parsePostLegacySub", () => {
    expect(parsePostLegacySub("/post/5/notes/")).toEqual({ postId: 5, mode: "notes" });
    expect(parsePostLegacySub("/post/new/notes/")).toBeNull();
  });

  it("parseGChatLegacyPath", () => {
    expect(parseGChatLegacyPath("/gchat/gc1/")).toBe("gc1");
    expect(parseGChatLegacyPath("/gchat/")).toBeNull();
  });

  it("getParentPath for post", () => {
    expect(getParentPath("/post/1/")).toBe("/feed/");
  });

  it("statePatchToHref for gchat", () => {
    expect(
      statePatchToHref({ screen: "gchat", gchatId: "gc1" }, { screen: "chats", currentPostId: null, postMode: "chat" }),
    ).toBe("/gchat/?id=gc1");
  });
});

describe("replies", () => {
  it("returns global reply for keyword", () => {
    expect(getGlobalReply("контент-план на неделю")).toContain("контент-план");
  });

  it("returns post reply for rewrite", () => {
    expect(getPostReply("перепиши вступление")).toContain("переработанная");
  });
});

describe("postStatusSchema", () => {
  it("accepts valid status", () => {
    expect(postStatusSchema.parse("draft")).toBe("draft");
  });
});
