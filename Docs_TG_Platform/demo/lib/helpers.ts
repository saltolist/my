import type { Post, PostMedia } from "./types";

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

const RU_MONTHS_3: Record<string, number> = {
  янв: 0,
  фев: 1,
  мар: 2,
  апр: 3,
  май: 4,
  мая: 4,
  июн: 5,
  июл: 6,
  авг: 7,
  сен: 8,
  окт: 9,
  ноя: 10,
  дек: 11,
};

export function postFreshness(post: Post): number {
  const raw = (post.date || post.created || "").trim().toLowerCase();
  if (!raw) return 0;
  if (/^(только что|сейчас|сегодня)/.test(raw)) return Date.now();
  const m = raw.match(/(\d{1,2})\s+([а-яё]+)(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return 0;
  const day = parseInt(m[1], 10);
  const month = RU_MONTHS_3[m[2].slice(0, 3)];
  if (month === undefined) return 0;
  const year = new Date().getFullYear();
  const hour = m[3] ? parseInt(m[3], 10) : 0;
  const minute = m[4] ? parseInt(m[4], 10) : 0;
  return new Date(year, month, day, hour, minute).getTime();
}

export function postStatusIcon(post: Post): string {
  if (post.status === "published") return "📢";
  if (post.status === "scheduled") return "🕐";
  return "📝";
}

export function postStatusLabel(post: Post): string {
  if (post.status === "published") return `Опубликован${post.date ? ` · ${post.date}` : ""}`;
  if (post.status === "scheduled") return `Отложен${post.date ? ` · ${post.date}` : ""}`;
  return `Черновик${post.created ? ` · ${post.created}` : ""}`;
}

export function shortComposerLabel(value: string, maxLen = 22): string {
  const text = String(value || "").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 2)) + "..";
}

export function autoResize(el: HTMLTextAreaElement, maxLines: number = 5): void {
  const cs = window.getComputedStyle(el);
  let lineHeight = parseFloat(cs.lineHeight);
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    lineHeight = parseFloat(cs.fontSize) * 1.4;
  }
  const paddingTop = parseFloat(cs.paddingTop) || 0;
  const paddingBottom = parseFloat(cs.paddingBottom) || 0;
  const borderTop = parseFloat(cs.borderTopWidth) || 0;
  const borderBottom = parseFloat(cs.borderBottomWidth) || 0;
  const maxHeight = lineHeight * maxLines + paddingTop + paddingBottom + borderTop + borderBottom;
  el.style.height = "auto";
  const desired = el.scrollHeight;
  if (desired > maxHeight) {
    el.style.height = maxHeight + "px";
    el.style.overflowY = "auto";
  } else {
    el.style.height = desired + "px";
    el.style.overflowY = "hidden";
  }
}

export function getPostMediaItems(post: Post | null | undefined): PostMedia[] {
  if (!post) return [];
  if (Array.isArray(post.media)) return post.media;
  return [];
}

export function isImageMedia(m: PostMedia): boolean {
  return m.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(m.name);
}

export function isVideoMedia(m: PostMedia): boolean {
  return m.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(m.name);
}

export function readFileAsMedia(file: File): Promise<PostMedia> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        url: typeof reader.result === "string" ? reader.result : "",
        type: file.type || "",
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
