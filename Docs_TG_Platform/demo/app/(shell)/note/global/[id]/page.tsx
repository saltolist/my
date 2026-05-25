import { STATIC_GLOBAL_NOTE_IDS } from "@/lib/staticParams";
import NoteScreen from "@/components/screens/NoteScreen";

export function generateStaticParams() {
  return STATIC_GLOBAL_NOTE_IDS.map((id) => ({ id }));
}

export default function GlobalNotePage() {
  return <NoteScreen />;
}
