"use client";

import { Suspense } from "react";
import GlobalChatScreen from "@/screens/gchat/ui/GlobalChatScreen";

export default function GChatPage() {
  return (
    <Suspense fallback={null}>
      <GlobalChatScreen />
    </Suspense>
  );
}
