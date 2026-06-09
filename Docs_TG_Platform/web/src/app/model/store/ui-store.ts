import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  FEED_POST_WIDTHS,
  type FeedPostWidth,
  isFeedPostWidth,
} from "@/shared/lib/feedPostWidth";
import type { ComposerAttachment, ComposerScope, ThemeMode } from "@/shared/types";

export type { FeedPostWidth as FeedCardWidth };

const SIDEBAR_COLLAPSED_STORAGE_KEY = "tg-platform-sidebar-collapsed";

const emptyComposerAttachments = (): Record<ComposerScope, ComposerAttachment[]> => ({
  home: [],
  gchat: [],
  post: [],
});

export type UiState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  themePreference: ThemeMode;
  setThemePreference: (theme: ThemeMode) => void;
  feedCardWidth: FeedPostWidth;
  setFeedCardWidth: (width: FeedPostWidth) => void;
  composerAttachments: Record<ComposerScope, ComposerAttachment[]>;
  addComposerAttachment: (scope: ComposerScope, attachment: ComposerAttachment) => void;
  removeComposerAttachment: (scope: ComposerScope, attachmentId: string) => void;
  clearComposerAttachments: (scope: ComposerScope) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      themePreference: "system",
      setThemePreference: (theme) => set({ themePreference: theme }),
      feedCardWidth: FEED_POST_WIDTHS[0],
      setFeedCardWidth: (width) => {
        if (!isFeedPostWidth(width)) return;
        set({ feedCardWidth: width });
      },
      composerAttachments: emptyComposerAttachments(),
      addComposerAttachment: (scope, attachment) =>
        set((state) => ({
          composerAttachments: {
            ...state.composerAttachments,
            [scope]: [...state.composerAttachments[scope], attachment],
          },
        })),
      removeComposerAttachment: (scope, attachmentId) =>
        set((state) => ({
          composerAttachments: {
            ...state.composerAttachments,
            [scope]: state.composerAttachments[scope].filter((a) => a.id !== attachmentId),
          },
        })),
      clearComposerAttachments: (scope) =>
        set((state) => ({
          composerAttachments: {
            ...state.composerAttachments,
            [scope]: [],
          },
        })),
    }),
    {
      name: SIDEBAR_COLLAPSED_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
