"use client";

import { NavigationProvider } from "@/app/model/store/navigation-provider";
import { ComposerProvider } from "@/app/model/store/composer-store";
import { DomainProvider } from "@/app/model/store/domain-store";
import { UiProvider } from "@/app/model/store/ui-store";
import AppShell from "@/widgets/app-shell/ui/AppShell";

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
