"use client";

import { SidebarBrand } from "@/widgets/sidebar/ui/sidebar-brand";
import { SidebarCollapseButton } from "@/widgets/sidebar/ui/sidebar-collapse-button";

type SidebarHeaderProps = {
  railActive: boolean;
  railAllowed: boolean;
  onGoHome: () => void;
  onExpand: () => void;
  onCollapse: () => void;
};

export function SidebarHeader({
  railActive,
  railAllowed,
  onGoHome,
  onExpand,
  onCollapse,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
      {railActive ? (
        <SidebarBrand onClick={onExpand} showLabel={false} />
      ) : (
        <>
          <SidebarBrand onClick={onGoHome} />
          {railAllowed ? <SidebarCollapseButton onClick={onCollapse} /> : null}
        </>
      )}
    </div>
  );
}
