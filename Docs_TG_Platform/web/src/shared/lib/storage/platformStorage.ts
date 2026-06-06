const PREFIX = "tg-platform-";

export function readPlatformStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(`${PREFIX}${key}`);
  } catch {
    return null;
  }
}

export function writePlatformStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, value);
  } catch {}
}

export function removePlatformStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  } catch {}
}
