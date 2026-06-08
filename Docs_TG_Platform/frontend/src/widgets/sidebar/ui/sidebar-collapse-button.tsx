"use client";

import { Button } from "@/shared/ui/button";
import { NavIconCollapse } from "@/widgets/sidebar/ui/nav-icons";

type SidebarCollapseButtonProps = {
  onClick: () => void;
};

export function SidebarCollapseButton({ onClick }: SidebarCollapseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label="Свернуть панель"
      title="Свернуть панель"
    >
      <NavIconCollapse />
    </Button>
  );
}
