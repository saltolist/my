import { runNotePersist } from "@/shared/lib/notePersistRegistry";
import type { ActiveNote } from "@/shared/types";

const NOTE_LEAVE_MSG =
  "У вас есть несохранённые изменения в заметке. Покинуть страницу без сохранения?";

/** @returns true if navigation may proceed */
export function confirmLeaveNote(note: ActiveNote | null, noteDirty: boolean): boolean {
  if (!note || !noteDirty) return true;
  if (note.isNew) {
    runNotePersist();
    return true;
  }
  return window.confirm(NOTE_LEAVE_MSG);
}
