import { STATIC_GLOBAL_NOTE_IDS } from "@/shared/lib/staticParams";
import { NoteScreen } from "@/screens/note";

export function generateStaticParams() {
  return STATIC_GLOBAL_NOTE_IDS.map((id) => ({ id }));
}

export default function GlobalNotePage() {
  return <NoteScreen />;
}
