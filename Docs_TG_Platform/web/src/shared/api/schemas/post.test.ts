import { describe, expect, it } from "vitest";
import { postSchema, postsListSchema } from "./post";

describe("post schemas", () => {
  it("validates post", () => {
    const parsed = postSchema.parse({
      id: 1,
      status: "draft",
      created: "now",
      text: "hello",
      rubric: null,
    });
    expect(parsed.id).toBe(1);
  });

  it("rejects invalid status", () => {
    expect(() =>
      postSchema.parse({
        id: 1,
        status: "invalid",
        created: "now",
        text: "",
        rubric: null,
      }),
    ).toThrow();
  });

  it("validates posts list", () => {
    const list = postsListSchema.parse([]);
    expect(list).toEqual([]);
  });
});
