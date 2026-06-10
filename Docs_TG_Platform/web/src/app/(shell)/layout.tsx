import { Suspense } from "react";

import { ComposerNavBridge } from "@/widgets/composer/ui/ComposerNavBridge";
import { AppShell, ContentAdaptSync, RouteSync } from "@/widgets/app-shell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <ContentAdaptSync />
      <Suspense fallback={null}>
        <RouteSync />
        <ComposerNavBridge />
      </Suspense>
      {children}
    </AppShell>
  );
}
