import type { PostMode } from "@/shared/types";

const TAB_MODES: PostMode[] = ["notes", "chats", "comments"];

/** Переключение вкладки поста: повторный клик по активной — возврат в режим чата поста. */
export function resolvePostViewMode(
  currentMode: PostMode,
  nextMode: PostMode,
): PostMode {
  if (TAB_MODES.includes(nextMode) && currentMode === nextMode) {
    return "chat";
  }
  return nextMode;
}
