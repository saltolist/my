import type { NoteListFilter } from "@/shared/types";

export const LIST_CONTEXT_FILTER_OPTIONS: NoteListFilter[] = ["all", "ai", "noai"];

export function listContextFilterLabel(value: NoteListFilter, desktop: boolean): string {
  if (value === "all") return "Все";
  if (value === "ai") return desktop ? "В контексте ИИ" : "В контексте";
  return desktop ? "Не в контексте ИИ" : "Не в контексте";
}

export function matchesListContextFilter(ai: boolean, filter: NoteListFilter): boolean {
  if (filter === "ai") return ai;
  if (filter === "noai") return !ai;
  return true;
}
