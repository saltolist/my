"use client";

import { Suspense } from "react";
import { GlobalChatScreen } from "@/screens/gchat";

export default function GChatPage() {
  return (
    <Suspense fallback={null}>
      <GlobalChatScreen />
    </Suspense>
  );
}
