import { describe, expect, it, vi } from "vitest";
import {
  buildGChatBreadcrumbTrail,
  buildNoteBreadcrumbTrail,
  buildPostBreadcrumbTrail,
} from "./breadcrumbTrails";
import type { ActiveNote, LocalChat, Post } from "@/shared/types";

const post: Post = {
  id: 1,
  status: "published",
  rubric: null,
  text: "Post body",
  notes: [],
  chats: [],
};

const activeChat: LocalChat = {
  id: 10,
  title: "Chat title",
  preview: "",
  date: "d",
  history: [],
  ai: true,
};

describe("buildNoteBreadcrumbTrail", () => {
  it("builds global note trail", () => {
    const note: ActiveNote = {
      id: "g1",
      isGlobal: true,
      title: "My note",
      body: "",
      ai: false,
      date: "d",
      files: [],
    };
    const items = buildNoteBreadcrumbTrail({
      note,
      parentPost: null,
      onNavigateNotes: vi.fn(),
      onNavigateFeed: vi.fn(),
      onOpenPost: vi.fn(),
    });
    expect(items).toHaveLength(2);
    expect(items[0]?.label).toBe("Заметки");
    expect(items[1]?.current).toBe(true);
  });

  it("builds local note trail with parent post", () => {
    const note: ActiveNote = {
      id: 5,
      isGlobal: false,
      postId: 1,
      title: "Local",
      body: "",
      ai: false,
      date: "d",
      files: [],
    };
    const items = buildNoteBreadcrumbTrail({
      note,
      parentPost: post,
      onNavigateNotes: vi.fn(),
      onNavigateFeed: vi.fn(),
      onOpenPost: vi.fn(),
    });
    expect(items).toHaveLength(3);
    expect(items[0]?.label).toBe("Лента");
    expect(items[1]?.variant).toBe("title");
  });
});

describe("buildPostBreadcrumbTrail", () => {
  const base = {
    post,
    postMode: "chat" as const,
    currentPostChatId: null,
    activeChat: null,
    postSubPage: null,
    postIntermediateCrumb: "Post title",
    onNavigateFeed: vi.fn(),
    onOpenPostView: vi.fn(),
    onResetToPostChatRoot: vi.fn(),
  };

  it("builds subpage trail", () => {
    const items = buildPostBreadcrumbTrail({ ...base, postSubPage: "Заметки" });
    expect(items).toHaveLength(3);
    expect(items[2]?.label).toBe("Заметки");
  });

  it("builds active chat trail", () => {
    const items = buildPostBreadcrumbTrail({
      ...base,
      currentPostChatId: 10,
      activeChat,
    });
    expect(items).toHaveLength(3);
    expect(items[2]?.label).toBe("Chat title");
  });

  it("builds default post trail", () => {
    const items = buildPostBreadcrumbTrail(base);
    expect(items).toHaveLength(2);
    expect(items[1]?.current).toBe(true);
  });
});

describe("buildGChatBreadcrumbTrail", () => {
  it("builds chats trail", () => {
    const items = buildGChatBreadcrumbTrail({
      chatTitle: "Strategy",
      onNavigateBackToChats: vi.fn(),
    });
    expect(items).toHaveLength(2);
    expect(items[0]?.label).toBe("Чаты");
    expect(items[1]?.label).toBe("Strategy");
  });
});
