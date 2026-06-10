import { initialGlobalNotes, initialPosts } from "@/shared/data/seed-data";
import { POST_NEW_SLUG } from "@/shared/lib/routes";

export { POST_NEW_SLUG };

export const STATIC_POST_IDS = initialPosts.map((p) => String(p.id));
export const STATIC_GLOBAL_NOTE_IDS = initialGlobalNotes.map((n) => n.id);

export function staticPostNoteParams(): { postId: string; noteId: string }[] {
  const out: { postId: string; noteId: string }[] = [];
  for (const p of initialPosts) {
    for (const n of p.notes) {
      out.push({ postId: String(p.id), noteId: String(n.id) });
    }
  }
  return out;
}
