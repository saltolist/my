"use client";

import type { ReactNode } from "react";

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
  return (
    <div className="space-y-1">
      <SidebarNavItem
        label={label}
        icon={icon}
        active={active}
        onClick={onNavClick}
        showLabel={showLabel}
        trailing={
          showLabel ? (
            <button
              type="button"
              className="rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              aria-label={expanded ? collapseLabel : expandLabel}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
            >
              <NavIconChevron expanded={expanded} />
            </button>
          ) : undefined
        }
      />
      {showLabel && expanded ? children : null}
    </div>
  );
}
