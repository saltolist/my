import type { ComposerScope } from "@/shared/types";

export const COMPOSER_DEFAULT_PLACEHOLDER = "Сообщение... введите @ чтобы прикрепить пост";

export type ComposerAttachScope = ComposerScope | "feed";

export function composerMaxRows(scope: ComposerAttachScope): 10 | 16 {
  return scope === "home" ? 10 : 16;
}

export function composerMenuSide(scope: ComposerAttachScope): "top" | "bottom" {
  return scope === "home" ? "bottom" : "top";
}

export function composerStoreScope(scope: ComposerAttachScope): ComposerScope {
  return scope === "feed" ? "home" : scope;
}
