import { buildProfileDiscardPatch } from "@/shared/lib/profileDiscard";
import { isOmnichannelChatId } from "@/shared/lib/omnichannel";
import type { DomainState } from "@/app/model/store/domain/types";
import type { NavigationPatch, NavigationState } from "@/app/model/store/navigation/types";

function withPostEditDiscarded(
  nav: NavigationState,
  patch: NavigationPatch,
): NavigationPatch {
  const nextScreen = patch.screen ?? nav.screen;
  if (nav.screen === "post" && nav.isEditing && nextScreen !== "post") {
    return { ...patch, isEditing: false };
  }
  return patch;
}

function withNoteEditsDiscarded(
  nav: NavigationState,
  patch: NavigationPatch,
): NavigationPatch {
  const nextScreen = patch.screen ?? nav.screen;
  if (nav.screen !== "note" || nextScreen === "note" || !nav.currentNote) return patch;
  return { ...patch, currentNote: null, noteMode: "view" };
}

/** Navigation-only guards when leaving screens with unsaved edits. */
export function buildGuardedNavigationPatch(
  nav: NavigationState,
  patch: NavigationPatch,
): NavigationPatch {
  return withNoteEditsDiscarded(nav, withPostEditDiscarded(nav, patch));
}

/** Domain snapshot restore when navigating away from profile without explicit save. */
export function profileDiscardDomainPatchIfLeaving(
  nav: NavigationState,
  domain: DomainState,
  navPatch: NavigationPatch,
): Partial<DomainState> {
  const nextScreen = navPatch.screen ?? nav.screen;
  if (nav.screen !== "profile" || nextScreen === "profile") return {};
  return buildProfileDiscardPatch(domain);
}

export function telegramConfigNavPatch(
  nav: NavigationState,
  config: DomainState["telegramProfileConfig"],
): NavigationPatch | null {
  if (config.botStatus !== "connected" && isOmnichannelChatId(nav.currentGChatId)) {
    return { currentGChatId: null };
  }
  return null;
}

export type ProcessedCombinedPatch = {
  domainPatch: Partial<DomainState>;
  navPatch: NavigationPatch;
};

/** Split a legacy SET_STATE patch into domain + guarded navigation updates. */
export function processCombinedPatch(
  nav: NavigationState,
  domain: DomainState,
  patch: Record<string, unknown>,
): ProcessedCombinedPatch {
  const domainPatch: Partial<DomainState> = {};
  const rawNavPatch: NavigationPatch = {};

  for (const [key, value] of Object.entries(patch)) {
    if (
      key === "screen" ||
      key === "currentPostId" ||
      key === "currentPostChatId" ||
      key === "postMode" ||
      key === "postViewStack" ||
      key === "isEditing" ||
      key === "currentGChatId" ||
      key === "currentNote" ||
      key === "noteMode" ||
      key === "noteFrom" ||
      key === "noteSavedSnapshot" ||
      key === "chatsTab" ||
      key === "noteScope" ||
      key === "noteFilter"
    ) {
      (rawNavPatch as Record<string, unknown>)[key] = value;
    } else {
      (domainPatch as Record<string, unknown>)[key] = value;
    }
  }

  const navPatch = buildGuardedNavigationPatch(nav, rawNavPatch);
  const profileDiscard = profileDiscardDomainPatchIfLeaving(nav, domain, navPatch);

  return {
    domainPatch: { ...domainPatch, ...profileDiscard },
    navPatch,
  };
}
