"use client";

import { NavigationProvider } from "@/state/navigation-provider";
import { ComposerProvider } from "@/state/composer-store";
import { DomainProvider } from "@/state/domain-store";
import { UiProvider } from "@/state/ui-store";
import AppShell from "@/components/AppShell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <DomainProvider>
        <ComposerProvider>
          <NavigationProvider>
            <AppShell>{children}</AppShell>
          </NavigationProvider>
        </ComposerProvider>
      </DomainProvider>
    </UiProvider>
  );
}
