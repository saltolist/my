/** GitHub Pages / static host prefix (no trailing slash). Empty = site root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export const API_V1 = `${BASE_PATH}/api/v1`;
