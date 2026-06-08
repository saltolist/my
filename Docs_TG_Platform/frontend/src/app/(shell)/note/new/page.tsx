import { Suspense } from "react";
import { NoteScreen } from "@/screens/note";
import { Skeleton } from "@/shared/ui/skeleton";

export default function NewNotePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-4 h-32 w-full" />}>
      <NoteScreen />
    </Suspense>
  );
}
