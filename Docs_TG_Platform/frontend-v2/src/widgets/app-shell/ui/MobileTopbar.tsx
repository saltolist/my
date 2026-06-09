"use client";

import { Menu } from "lucide-react";

import { useUiStore } from "@/app/model/store";
import { Button } from "@/shared/ui/button";

export function MobileTopbar() {
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="glass-surface flex h-[var(--shell-header-height)] items-center border-b px-3 min-[761px]:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Открыть меню"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="size-4" />
      </Button>
      <span className="ml-2 text-sm font-medium">TG Platform 2.0</span>
    </header>
  );
}
