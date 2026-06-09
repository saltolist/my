"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { MswProvider } from "./MswProvider";
import { QueryProvider } from "./QueryProvider";
import { RepositoryProvider } from "./RepositoryProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MswProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryProvider>
          <RepositoryProvider>
            <TooltipProvider delay={0}>{children}</TooltipProvider>
          </RepositoryProvider>
        </QueryProvider>
      </ThemeProvider>
    </MswProvider>
  );
}
