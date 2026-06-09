import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ComposerAttachment, ComposerScope, FeedCardWidth, ThemeMode } from "@/shared/types";

export type { FeedCardWidth };

const FEED_CARD_WIDTHS: FeedCardWidth[] = [500, 390, 270];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "tg-platform-v2-sidebar-collapsed";

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
  feedCardWidth: FeedCardWidth;
  setFeedCardWidth: (width: FeedCardWidth) => void;
  composerAttachments: Record<ComposerScope, ComposerAttachment[]>;
  addComposerAttachment: (scope: ComposerScope, attachment: ComposerAttachment) => void;
  removeComposerAttachment: (scope: ComposerScope, attachmentId: string) => void;
  clearComposerAttachments: (scope: ComposerScope) => void;
};

export const useUiStore = create<UiState>()(
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
