import type { ActiveNote, NoteFile } from "./types";
import { canonicalNoteBody } from "./noteEmbeds";

export function draftNoteTitle(title: string) {
  return title.trim() || "Без названия";
}

export function noteIdentityKey(note: ActiveNote): string {
  return note.isGlobal ? `g-${note.id}` : `p${note.postId}-${note.id}`;
}

/** Стабильное сравнение вложений: без blob-url и прочих полей сессии. */
export function snapshotNoteFiles(files: NoteFile[]) {
  return (Array.isArray(files) ? files : [])
    .map((f) => ({ name: f.name, type: f.type || "file" }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function buildNoteSnapshot(title: string, body: string, ai: boolean, files: NoteFile[]) {
  return JSON.stringify({
    title: title.trim(),
    body: canonicalNoteBody(body),
    ai,
    files: snapshotNoteFiles(files),
  });
}

export const EMPTY_NOTE_SNAPSHOT = buildNoteSnapshot("", "", false, []);

export function isNoteImageFile(file: NoteFile): boolean {
  if (file.type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif|heic)$/i.test(file.name);
}

export function createNewGlobalNote(): ActiveNote {
  return {
    id: "gn-new",
    title: "",
    body: "",
    ai: false,
    date: "сейчас",
    isGlobal: true,
    files: [],
    isNew: true,
  };
}

export function createNewPostNote(postId: number): ActiveNote {
  return {
    id: 0,
    title: "",
    body: "",
    ai: false,
    date: "сейчас",
    isGlobal: false,
    postId,
    files: [],
    isNew: true,
  };
}
