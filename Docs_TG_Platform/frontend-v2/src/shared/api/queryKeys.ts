export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: () => [...queryKeys.posts.all, "list"] as const,
    detail: (id: number) => [...queryKeys.posts.all, "detail", id] as const,
  },
  globalChats: {
    all: ["globalChats"] as const,
    list: () => [...queryKeys.globalChats.all, "list"] as const,
    detail: (id: string) => [...queryKeys.globalChats.all, "detail", id] as const,
  },
  globalNotes: {
    all: ["globalNotes"] as const,
    list: () => [...queryKeys.globalNotes.all, "list"] as const,
    detail: (id: string) => [...queryKeys.globalNotes.all, "detail", id] as const,
  },
  profile: {
    all: ["profile"] as const,
    channel: () => [...queryKeys.profile.all, "channel"] as const,
    ai: () => [...queryKeys.profile.all, "ai"] as const,
    telegram: () => [...queryKeys.profile.all, "telegram"] as const,
  },
} as const;
