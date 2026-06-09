import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { FeedCardWidth, ThemeMode } from "@/shared/types";

const FEED_CARD_WIDTHS: FeedCardWidth[] = [500, 390, 270];
const SIDEBAR_COLLAPSED_STORAGE_KEY = "tg-platform-v2-sidebar-collapsed";

type UiStore = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  themePreference: ThemeMode;
  setThemePreference: (theme: ThemeMode) => void;
  feedCardWidth: FeedCardWidth;
  setFeedCardWidth: (width: FeedCardWidth) => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      themePreference: "system",
      setThemePreference: (theme) => set({ themePreference: theme }),
      feedCardWidth: 500,
      setFeedCardWidth: (width) => {
        if (!FEED_CARD_WIDTHS.includes(width)) return;
        set({ feedCardWidth: width });
      },
    }),
    {
      name: SIDEBAR_COLLAPSED_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        themePreference: state.themePreference,
      }),
    },
  ),
);
