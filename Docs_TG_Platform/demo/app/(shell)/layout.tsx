"use client";

import { AppProvider } from "@/state/AppContext";
import AppShell from "@/components/AppShell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
