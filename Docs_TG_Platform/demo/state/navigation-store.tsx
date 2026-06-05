"use client";

import { createContext, useContext } from "react";
import type { ScreenId } from "@/lib/types";
import type { NavigationAction, NavigationState } from "@/state/navigation/types";

export type NavigationContextValue = NavigationState & {
  navigate: (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => void;
  navigateBack: (fallback?: ScreenId) => void;
  navigateWithState: (patch: Partial<NavigationState & Record<string, unknown>>) => void;
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  goHome: () => void;
  openPost: (id: number | "new") => void;
  setPostView: (mode: import("@/lib/types").PostMode, chatId?: number | null) => void;
  openPostComments: (id: number) => void;
  openGChat: (id: string) => void;
  canLeaveCurrentScreen: (next: ScreenId) => boolean;
  confirmDiscardPostEdit: () => boolean;
  confirmDiscardAnyEdit: () => boolean;
  discardPendingEdits: () => void;
  discardProfileEdits: () => void;
  registerUserMessageEdit: (discard: () => void) => void;
  unregisterUserMessageEdit: (discard: () => void) => void;
  registerNotePersist: (fn: (() => void) | null) => void;
  navDispatch: React.Dispatch<NavigationAction>;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used inside <NavigationProvider>");
  return ctx;
}

export { NavigationContext };
