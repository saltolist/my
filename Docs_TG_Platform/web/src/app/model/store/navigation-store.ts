import { create } from "zustand";

import {
  initialNavigationState,
  type NavigationPatch,
  type NavigationState,
} from "@/app/model/store/navigation/types";

function applyNavigationPatch(
  state: NavigationState,
  patch: NavigationPatch,
): NavigationState {
  const next = { ...state, ...patch };
  if (next.screen !== "post") {
    next.isEditing = false;
  }
  return next;
}

export type NavigationStore = NavigationState & {
  setNav: (patch: NavigationPatch) => void;
  resetNav: () => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  ...initialNavigationState,
  setNav: (patch) => set((state) => applyNavigationPatch(state, patch)),
  resetNav: () => set(initialNavigationState),
}));
