"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryProvider } from "./QueryProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider delay={0}>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
