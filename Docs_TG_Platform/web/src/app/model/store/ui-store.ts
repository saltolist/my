import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  FEED_POST_WIDTHS,
  type FeedPostWidth,
  isFeedPostWidth,
} from "@/shared/lib/feedPostWidth";

export type { FeedPostWidth as FeedCardWidth };

const SIDEBAR_COLLAPSED_STORAGE_KEY = "tg-platform-sidebar-collapsed";

export type UiState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  feedCardWidth: FeedPostWidth;
  setFeedCardWidth: (width: FeedPostWidth) => void;
  noteDirty: boolean;
  setNoteDirty: (dirty: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      feedCardWidth: FEED_POST_WIDTHS[0],
      setFeedCardWidth: (width) => {
        if (!isFeedPostWidth(width)) return;
        set({ feedCardWidth: width });
      },
      noteDirty: false,
      setNoteDirty: (noteDirty) => set({ noteDirty }),
    }),
    {
      name: SIDEBAR_COLLAPSED_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
