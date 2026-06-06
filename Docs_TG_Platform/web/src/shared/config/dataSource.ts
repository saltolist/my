/**
 * Seed mode: in-memory demo data, no REST sync.
 * - Unset in development → seed (default for local UI work).
 * - NEXT_PUBLIC_USE_SEED=0 → API mode (requires NEXT_PUBLIC_API_BASE_URL).
 * - NEXT_PUBLIC_USE_SEED=1 → force seed even in production builds.
 */
export const USE_SEED_DATA =
  process.env.NEXT_PUBLIC_USE_SEED === "1" ||
  (process.env.NEXT_PUBLIC_USE_SEED !== "0" && process.env.NODE_ENV === "development");

/** Base URL for REST API (no trailing slash). Empty = API mode disabled. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

/** Load lists from API on mount and persist domain mutations. */
export const API_SYNC_ENABLED = !USE_SEED_DATA && API_BASE_URL.length > 0;
