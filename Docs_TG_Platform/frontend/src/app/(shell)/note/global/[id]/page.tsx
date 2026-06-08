import { Suspense } from "react";
import { NoteScreen } from "@/screens/note";
import { Skeleton } from "@/shared/ui/skeleton";
import { STATIC_GLOBAL_NOTE_IDS } from "@/shared/lib/staticParams";

export function generateStaticParams() {
  return STATIC_GLOBAL_NOTE_IDS.map((id) => ({ id }));
}

export default function GlobalNotePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-4 h-32 w-full" />}>
      <NoteScreen />
    </Suspense>
  );
}
