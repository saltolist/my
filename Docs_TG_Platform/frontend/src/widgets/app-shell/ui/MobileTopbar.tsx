"use client";

import { MenuIcon } from "lucide-react";

import { useUiStore } from "@/app/model/store";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type MobileTopbarProps = {
  className?: string;
};

export function MobileTopbar({ className }: MobileTopbarProps) {
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <header
      className={cn(
        "glass-header flex h-14 shrink-0 items-center gap-3 border-b px-3 min-[761px]:hidden",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        <MenuIcon />
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-base leading-none" aria-hidden>
          ✦
        </span>
        <span className="truncate text-sm font-semibold">TG Platform</span>
      </div>
    </header>
  );
}
