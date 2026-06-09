"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { SidebarNavItem } from "@/widgets/sidebar/ui/SidebarNavItem";
import { NavIconChevron } from "@/widgets/sidebar/ui/nav-icons";

type SidebarExpandableNavProps = {
  label: string;
  icon: ReactNode;
  active: boolean;
  expanded: boolean;
  showLabel: boolean;
  expandLabel: string;
  collapseLabel: string;
  onNavClick: () => void;
  onToggleExpanded: () => void;
  children?: ReactNode;
};

export function SidebarExpandableNav({
  label,
  icon,
  active,
  expanded,
  showLabel,
  expandLabel,
  collapseLabel,
  onNavClick,
  onToggleExpanded,
  children,
}: SidebarExpandableNavProps) {
  if (!showLabel) {
    return (
      <div className="space-y-1">
        <SidebarNavItem
          label={label}
          icon={icon}
          active={active}
          onClick={onNavClick}
          showLabel={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-lg",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/85",
        )}
      >
        <button
          type="button"
          onClick={onNavClick}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2 text-sm transition-colors",
            !active && "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        </button>
        <button
          type="button"
          className="flex shrink-0 items-center px-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label={expanded ? collapseLabel : expandLabel}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <NavIconChevron expanded={expanded} />
        </button>
      </div>
      {expanded ? children : null}
    </div>
  );
}
