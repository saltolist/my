import { staticPostNoteParams } from "@/lib/staticParams";
import NoteScreen from "@/components/screens/NoteScreen";

export function generateStaticParams() {
  return staticPostNoteParams();
}

export default function PostNotePage() {
  return <NoteScreen />;
}
