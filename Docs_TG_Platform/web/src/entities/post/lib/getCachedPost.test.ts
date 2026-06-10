import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { queryKeys } from "@/shared/api/queryKeys";
import type { Post } from "@/shared/types";

import { getCachedPost, setCachedPost } from "./getCachedPost";

const post: Post = {
  id: 1,
  text: "Hello",
  status: "draft",
  date: "сегодня",
  rubric: null,
  media: [],
  chats: [],
  notes: [],
};

describe("getCachedPost", () => {
  it("reads from list cache", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.posts.list(), [post]);
    expect(getCachedPost(qc, 1)).toEqual(post);
  });

  it("falls back to detail cache when list is empty", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.posts.detail(1), post);
    expect(getCachedPost(qc, 1)).toEqual(post);
  });

  it("returns undefined when post is missing", () => {
    const qc = new QueryClient();
    expect(getCachedPost(qc, 1)).toBeUndefined();
  });
});

describe("setCachedPost", () => {
  it("updates detail and list caches", () => {
    const qc = new QueryClient();
    const updated = { ...post, text: "Updated" };
    qc.setQueryData(queryKeys.posts.list(), [post]);
    qc.setQueryData(queryKeys.posts.detail(1), post);

    setCachedPost(qc, updated);

    expect(qc.getQueryData(queryKeys.posts.detail(1))).toEqual(updated);
    expect(qc.getQueryData<Post[]>(queryKeys.posts.list())?.[0]).toEqual(updated);
  });
});
