import type { NavigationAction, NavigationState } from "@/app/model/store/navigation/types";
import { initialNavigationState } from "@/app/model/store/navigation/types";

export { initialNavigationState };

export function applyNavigationPatch(
  state: NavigationState,
  patch: Partial<NavigationState>,
): NavigationState {
  const next = { ...state, ...patch };
  if (next.screen !== "post") {
    next.isEditing = false;
  }
  return next;
}

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case "SET_SCREEN":
      return applyNavigationPatch(state, { screen: action.screen });
    case "SET_NAV":
      return applyNavigationPatch(state, action.patch);
    default:
      return state;
  }
}
