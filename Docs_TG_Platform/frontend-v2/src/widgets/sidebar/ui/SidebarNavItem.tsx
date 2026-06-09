"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

type SidebarNavItemProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  showLabel?: boolean;
};

export function SidebarNavItem({
  label,
  icon,
  active = false,
  onClick,
  showLabel = true,
}: SidebarNavItemProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
        !showLabel && "justify-center px-2",
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      {showLabel ? <span className="min-w-0 flex-1 truncate text-left">{label}</span> : null}
    </button>
  );

  if (!showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
