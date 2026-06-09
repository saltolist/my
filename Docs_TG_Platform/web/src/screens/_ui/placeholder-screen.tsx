"use client";

import type { ReactNode } from "react";

type PlaceholderScreenProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PlaceholderScreen({ title, subtitle, children }: PlaceholderScreenProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  );
}
