"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ComposerProvider } from "@/app/model/store/composer-store";
import { ProfileHydrator } from "@/widgets/profile-settings/ui/ProfileHydrator";
import { MswProvider } from "./MswProvider";
import { QueryProvider } from "./QueryProvider";
import { RepositoryProvider } from "./RepositoryProvider";
import { ThemeProvider } from "./ThemeProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MswProvider>
      <ThemeProvider>
        <QueryProvider>
          <RepositoryProvider>
            <ComposerProvider>
              <ProfileHydrator />
              <TooltipProvider delay={0}>{children}</TooltipProvider>
            </ComposerProvider>
          </RepositoryProvider>
        </QueryProvider>
      </ThemeProvider>
    </MswProvider>
  );
}
