/**
 * Пороги адаптации экрана «Профиль» (desktop / tablet).
 * Mobile (viewport ≤ 760) намеренно не затрагивается.
 */

/** ИИ-движок: планшетная сетка (взаимоисключающие tier внутри диапазона). */
export const PROFILE_AI_ADAPT_MIN = 761;
export const PROFILE_AI_ADAPT_MAX = 1300;
export const PROFILE_AI_TIER_WIDE_MIN = 1001;
export const PROFILE_AI_TIER_MID_MIN = 950;
export const PROFILE_AI_TIER_COMPACT_MAX = 949;

/** Шапка: вкладки → селектор. */
export const PROFILE_HEADER_TABS_COMPACT_MAX = 1000;

/** Шапка: корзина «Удалить» у чекбоксов (ширина .page-header). */
export const PROFILE_HEADER_TRASH_COMPACT_MIN = 780;
export const PROFILE_HEADER_TRASH_COMPACT_MAX = 1080;

export type ProfileAiTier = "wide" | "mid" | "compact";

/** Один из трёх tier или null вне диапазона 761–1300. */
export function getProfileAiTier(contentAdaptPx: number): ProfileAiTier | null {
  if (contentAdaptPx < PROFILE_AI_ADAPT_MIN || contentAdaptPx > PROFILE_AI_ADAPT_MAX) {
    return null;
  }
  if (contentAdaptPx >= PROFILE_AI_TIER_WIDE_MIN) return "wide";
  if (contentAdaptPx >= PROFILE_AI_TIER_MID_MIN) return "mid";
  return "compact";
}

export function syncProfileAiAdaptToDocument(contentAdaptPx: number): void {
  const root = document.documentElement;
  const tier = getProfileAiTier(contentAdaptPx);
  root.toggleAttribute("data-profile-ai-adapt", tier !== null);
  if (tier === null) {
    root.removeAttribute("data-profile-ai-tier");
  } else {
    root.setAttribute("data-profile-ai-tier", tier);
  }
}

export function syncProfileHeaderTrashCompactToDocument(
  headerWidthPx: number,
  isMobile: boolean,
): void {
  const root = document.documentElement;
  const on =
    !isMobile &&
    headerWidthPx >= PROFILE_HEADER_TRASH_COMPACT_MIN &&
    headerWidthPx <= PROFILE_HEADER_TRASH_COMPACT_MAX;
  root.toggleAttribute("data-profile-header-trash-compact", on);
}

export function clearProfileAdaptFromDocument(): void {
  const root = document.documentElement;
  root.removeAttribute("data-profile-ai-adapt");
  root.removeAttribute("data-profile-ai-tier");
  root.removeAttribute("data-profile-header-trash-compact");
}

export const profileHeaderTabsCompactMq = `(max-width: ${PROFILE_HEADER_TABS_COMPACT_MAX}px)` as const;
