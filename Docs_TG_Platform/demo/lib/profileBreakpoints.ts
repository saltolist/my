/**
 * Пороги адаптации экрана «Профиль» (desktop / tablet).
 * Mobile (viewport ≤ 760) намеренно не затрагивается.
 */

/** ИИ-движок: планшетная сетка (взаимоисключающие tier внутри диапазона). */
export const PROFILE_AI_ADAPT_MIN = 761;
/** При overlay (сайдбар скрыт): тот же порог, что 761px с учётом --nav-sidebar-w (220). */
export const PROFILE_AI_ADAPT_OVERLAY_MIN = PROFILE_AI_ADAPT_MIN - 220;
export const PROFILE_AI_ADAPT_MAX = 1300;
export const PROFILE_AI_TIER_WIDE_MIN = 1001;
/** 950–1000: тот же layout, что compact (API + корзина в одной строке). */
export const PROFILE_AI_TIER_MID_MIN = 1001;
export const PROFILE_AI_TIER_COMPACT_MAX = 1000;

/** Шапка: вкладки → селектор. */
export const PROFILE_HEADER_TABS_COMPACT_MAX = 1000;

/** Поле канала (desktop): ниже — сжимается, выше — фикс. --telegram-auth-row-w. */
export const PROFILE_CHANNEL_INPUT_SHRINK_MAX = 1000;

/** ИИ-движок wide: отдельная строка футера, «Удалить» у правого края (content-adapt-w). */
export const PROFILE_AI_REMOVE_FLUSH_MIN = 1000;
export const PROFILE_AI_REMOVE_FLUSH_MAX = PROFILE_AI_ADAPT_MAX;

/** Шапка: корзина «Удалить» у чекбоксов (ширина .page-header). */
export const PROFILE_HEADER_TRASH_COMPACT_MIN = 780;
export const PROFILE_HEADER_TRASH_COMPACT_MAX = 1080;

/** Графики (desktop): при шапке ≤1080px — максимум 15 точек на оси X. */
export const PROFILE_HEADER_CHART_MAX_POINTS_MAX = 1080;

/** «Лучшие посты» (desktop): при шапке ≤780px — только Пост, ER и «к посту». */
export const PROFILE_HEADER_TOP_POSTS_COMPACT_MAX = 780;

/** Аналитика платформы (desktop): при шапке ≤650px — селектор периода в шапку. */
export const PROFILE_HEADER_PLATFORM_PERIOD_MAX = 650;

/** Канал + платформа (desktop): при шапке ≤1130px — метрики компактнее + график 360px. */
export const PROFILE_HEADER_CHANNEL_SUMMARY_COMPACT_MAX = 1130;

/** Канал (desktop): при шапке ≤930px — 6 карточек 3×2. Платформа: всегда 3 в ряд. */
export const PROFILE_HEADER_CHANNEL_SUMMARY_TWO_ROW_MAX = 930;

/** Высота графика «Динамика прироста» при узкой шапке (desktop, не mobile). */
export const PROFILE_HEADER_CHANNEL_CHART_HEIGHT_COMPACT_PX = 360;

export type ProfileAiTier = "wide" | "mid" | "compact";

/** Один из трёх tier или null вне диапазона адаптации. */
export function getProfileAiTier(
  widthPx: number,
  adaptMin: number = PROFILE_AI_ADAPT_MIN,
): ProfileAiTier | null {
  if (widthPx < adaptMin || widthPx > PROFILE_AI_ADAPT_MAX) {
    return null;
  }
  if (widthPx >= PROFILE_AI_TIER_WIDE_MIN) return "wide";
  if (widthPx >= PROFILE_AI_TIER_MID_MIN) return "mid";
  return "compact";
}

export type ProfileAiAdaptSyncContext = {
  viewportPx: number;
  shellOverlay: boolean;
};

export function syncProfileAiAdaptToDocument(
  contentAdaptPx: number,
  ctx?: ProfileAiAdaptSyncContext,
): void {
  const root = document.documentElement;
  const shellOverlay = ctx?.shellOverlay ?? false;
  const viewportPx = ctx?.viewportPx ?? contentAdaptPx;
  /** Overlay и viewport ≥541: tier по viewport, не по vw+sidebar (иначе 730→mid, корзина к чекбоксам). */
  const useOverlayTierBasis =
    shellOverlay && viewportPx >= PROFILE_AI_ADAPT_OVERLAY_MIN;
  const tierBasis = useOverlayTierBasis ? viewportPx : contentAdaptPx;
  const adaptMin = useOverlayTierBasis ? PROFILE_AI_ADAPT_OVERLAY_MIN : PROFILE_AI_ADAPT_MIN;
  const tier = getProfileAiTier(tierBasis, adaptMin);
  root.toggleAttribute("data-profile-ai-adapt", tier !== null);
  if (tier === null) {
    root.removeAttribute("data-profile-ai-tier");
  } else {
    root.setAttribute("data-profile-ai-tier", tier);
  }
  /** Только wide (1001+): mid держит корзину в строке с API, без отдельной строки футера. */
  const removeFlush =
    tier === "wide" &&
    contentAdaptPx >= PROFILE_AI_REMOVE_FLUSH_MIN &&
    contentAdaptPx <= PROFILE_AI_REMOVE_FLUSH_MAX;
  root.toggleAttribute("data-profile-ai-remove-flush", removeFlush);
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
  root.removeAttribute("data-profile-ai-remove-flush");
}

export const profileHeaderTabsCompactMq = `(max-width: ${PROFILE_HEADER_TABS_COMPACT_MAX}px)` as const;
