import { initialGlobalNotes, initialPosts } from "@/shared/data/demo-data";

export const POST_NEW_SLUG = "new";

export const STATIC_POST_IDS = initialPosts.map((p) => String(p.id));
export const STATIC_GLOBAL_NOTE_IDS = initialGlobalNotes.map((n) => n.id);

/** Все пары postId + noteId из демо-данных. */
export function staticPostNoteParams(): { postId: string; noteId: string }[] {
  const out: { postId: string; noteId: string }[] = [];
  for (const p of initialPosts) {
    for (const n of p.notes) {
      out.push({ postId: String(p.id), noteId: String(n.id) });
    }
  }
  return out;
}
