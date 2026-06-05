import { staticPostNoteParams } from "@/shared/lib/staticParams";
import NoteScreen from "@/screens/note/ui/NoteScreen";

export function generateStaticParams() {
  return staticPostNoteParams();
}

export default function PostNotePage() {
  return <NoteScreen />;
}
