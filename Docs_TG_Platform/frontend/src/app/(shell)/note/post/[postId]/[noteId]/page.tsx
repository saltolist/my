import { Suspense } from "react";
import { NoteScreen } from "@/screens/note";
import { Skeleton } from "@/shared/ui/skeleton";
import { staticPostNoteParams } from "@/shared/lib/staticParams";

export function generateStaticParams() {
  return staticPostNoteParams();
}

export default function PostNotePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-4 h-32 w-full" />}>
      <NoteScreen />
    </Suspense>
  );
}
