"use client";

import { Suspense } from "react";
import GlobalChatScreen from "@/components/screens/GlobalChatScreen";

export default function GChatPage() {
  return (
    <Suspense fallback={null}>
      <GlobalChatScreen />
    </Suspense>
  );
}
