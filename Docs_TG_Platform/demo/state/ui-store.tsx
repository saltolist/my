"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FEED_POST_WIDTH_STORAGE_KEY,
  readStoredFeedPostWidth,
  type FeedPostWidth,
} from "@/lib/feedPostWidth";
import type { ThemeMode } from "@/lib/types";

export type DirtyKey =
  | "note"
  | "profile-channel"
  | "profile-ai"
  | "profile-prompt"
  | "profile-telegram";

const PROFILE_DIRTY_KEYS: DirtyKey[] = [
  "profile-channel",
  "profile-ai",
  "profile-prompt",
  "profile-telegram",
];

const THEME_STORAGE_KEY = "tg-demo-theme";

const initialDirtyMap: Record<DirtyKey, boolean> = {
  note: false,
  "profile-channel": false,
  "profile-ai": false,
  "profile-prompt": false,
  "profile-telegram": false,
};

type UiContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  feedPostWidth: FeedPostWidth;
  setFeedPostWidth: (width: FeedPostWidth) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  setDirty: (key: DirtyKey, dirty: boolean) => void;
  noteDirty: boolean;
  profileChannelDirty: boolean;
  profileSettingsDirty: boolean;
  profileDirty: boolean;
  clearProfileDirtyFlags: () => void;
  clearNoteDirty: () => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [feedPostWidth, setFeedPostWidthState] = useState<FeedPostWidth>(500);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dirtyMap, setDirtyMap] = useState(initialDirtyMap);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "system" || stored === "dark") {
        setThemeState(stored);
      }
      setFeedPostWidthState(readStoredFeedPostWidth());
    } catch {
      /* ignore storage errors in demo */
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors in demo */
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FEED_POST_WIDTH_STORAGE_KEY, String(feedPostWidth));
    } catch {
      /* ignore storage errors in demo */
    }
  }, [feedPostWidth]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const setFeedPostWidth = useCallback((width: FeedPostWidth) => {
    setFeedPostWidthState(width);
  }, []);

  const setDirty = useCallback((key: DirtyKey, dirty: boolean) => {
    setDirtyMap((prev) => (prev[key] === dirty ? prev : { ...prev, [key]: dirty }));
  }, []);

  const clearProfileDirtyFlags = useCallback(() => {
    setDirtyMap((prev) => {
      const next = { ...prev };
      for (const key of PROFILE_DIRTY_KEYS) next[key] = false;
      return next;
    });
  }, []);

  const clearNoteDirty = useCallback(() => {
    setDirty("note", false);
  }, [setDirty]);

  const noteDirty = dirtyMap.note;
  const profileChannelDirty = dirtyMap["profile-channel"];
  const profileSettingsDirty =
    dirtyMap["profile-ai"] || dirtyMap["profile-prompt"] || dirtyMap["profile-telegram"];
  const profileDirty = profileChannelDirty || profileSettingsDirty;

  const value = useMemo<UiContextValue>(
    () => ({
      theme,
      setTheme,
      feedPostWidth,
      setFeedPostWidth,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      setDirty,
      noteDirty,
      profileChannelDirty,
      profileSettingsDirty,
      profileDirty,
      clearProfileDirtyFlags,
      clearNoteDirty,
    }),
    [
      theme,
      setTheme,
      feedPostWidth,
      setFeedPostWidth,
      mobileSidebarOpen,
      setDirty,
      noteDirty,
      profileChannelDirty,
      profileSettingsDirty,
      profileDirty,
      clearProfileDirtyFlags,
      clearNoteDirty,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}
