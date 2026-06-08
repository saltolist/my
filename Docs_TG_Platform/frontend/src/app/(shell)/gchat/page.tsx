import { Suspense } from "react";
import { GChatScreen } from "@/screens/gchat";
import { Skeleton } from "@/shared/ui/skeleton";

export default function GChatPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-4 h-32 w-full" />}>
      <GChatScreen />
    </Suspense>
  );
}
