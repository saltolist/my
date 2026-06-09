"use client";

import { PanelLeftClose } from "lucide-react";

import { Button } from "@/shared/ui/button";

type SidebarCollapseButtonProps = {
  onClick: () => void;
};

export function SidebarCollapseButton({ onClick }: SidebarCollapseButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label="Свернуть панель"
      title="Свернуть панель"
    >
      <PanelLeftClose className="size-4" />
    </Button>
  );
}
