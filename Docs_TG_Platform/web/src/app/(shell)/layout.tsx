import { Suspense } from "react";

import { AppShell, ContentAdaptSync, RouteSync } from "@/widgets/app-shell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <ContentAdaptSync />
      <Suspense fallback={null}>
        <RouteSync />
      </Suspense>
      {children}
    </AppShell>
  );
}
