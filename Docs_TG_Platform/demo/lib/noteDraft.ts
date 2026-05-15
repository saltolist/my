import type { ActiveNote, NoteFile } from "./types";

export const EMPTY_NOTE_SNAPSHOT = JSON.stringify({
  title: "",
  body: "",
  ai: false,
  files: [] as NoteFile[],
});

export function draftNoteTitle(title: string) {
  return title.trim() || "Без названия";
}

export function noteIdentityKey(note: ActiveNote): string {
  return note.isGlobal ? `g-${note.id}` : `p${note.postId}-${note.id}`;
}

export function buildNoteSnapshot(title: string, body: string, ai: boolean, files: NoteFile[]) {
  return JSON.stringify({ title: title.trim(), body, ai, files });
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
