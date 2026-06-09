"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/shared/ui/tooltip";
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
            <TooltipProvider delay={0}>{children}</TooltipProvider>
          </RepositoryProvider>
        </QueryProvider>
      </ThemeProvider>
    </MswProvider>
  );
}
