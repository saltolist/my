import type { Post } from "./types";

export function truncate(value: string | undefined | null, max: number): string {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) + "…" : value;
}

export function extractTitle(text: string | undefined | null): string {
  if (!text) return "";
  const firstLine = text.split("\n")[0];
  const dotIdx = firstLine.indexOf(".");
  return (dotIdx !== -1 ? firstLine.slice(0, dotIdx) : firstLine).trim();
}

export function postTitle(post: Post): string {
  return extractTitle(post.text) || "(без названия)";
}

export function shortComposerLabel(value: string, maxLen = 22): string {
  const text = String(value || "").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 2)) + "..";
}

export function autoResize(el: HTMLTextAreaElement): void {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

export function getPostMediaItems(post: Post | null | undefined): string[] {
  if (!post) return [];
  if (Array.isArray(post.media)) return post.media;
  if (typeof post.media === "string" && post.media.trim()) return [post.media.trim()];
  return [];
}
