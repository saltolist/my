import { describe, expect, it } from "vitest";
import { postStatusSchema } from "@/shared/api/schemas/post";
import { getGlobalReply, getPostReply } from "@/shared/lib/replies";
import { parseAppPath, routes } from "@/shared/lib/routes";

describe("routes", () => {
  it("parses feed path", () => {
    expect(parseAppPath("/feed/").screen).toBe("feed");
  });

  it("parses post path", () => {
    const parsed = parseAppPath("/post/1/");
    expect(parsed.screen).toBe("post");
    expect(parsed.postId).toBe(1);
  });

  it("builds gchat href", () => {
    expect(routes.gchat("gc1")).toBe("/gchat/?id=gc1");
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
