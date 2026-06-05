"use client";

import { AppProvider } from "@/state/AppContext";
import { ComposerProvider } from "@/state/composer-store";
import { DomainProvider } from "@/state/domain-store";
import { UiProvider } from "@/state/ui-store";
import AppShell from "@/components/AppShell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <DomainProvider>
        <ComposerProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ComposerProvider>
      </DomainProvider>
    </UiProvider>
  );
}
