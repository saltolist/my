export type ScreenId =
  | "home"
  | "feed"
  | "post"
  | "note"
  | "notes"
  | "chats"
  | "gchat"
  | "analytics"
  | "profile";

export type ThemeMode = "light" | "dark" | "system";

export type FeedCardWidth = 500 | 390 | 270;

export type ChatsTab = "all" | "global" | "local";

export type NoteListFilter = "all" | "ai" | "noai";

export type AnalyticsPeriod = "24h" | "7d" | "30d" | "90d" | "all";
