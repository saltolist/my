"use client";

import {
  ComposerProvider,
  DomainProvider,
  ShellNavigationProvider,
  UiProvider,
} from "@/app/model/store";
import { AppShell } from "@/widgets/app-shell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <DomainProvider>
        <ComposerProvider>
          <ShellNavigationProvider>
            <AppShell>{children}</AppShell>
          </ShellNavigationProvider>
        </ComposerProvider>
      </DomainProvider>
    </UiProvider>
  );
}
