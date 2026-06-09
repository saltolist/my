"use client";

import { MoreHorizontal } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { Button, type buttonVariants } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
};

type ContextMenuButtonProps = {
  items: ContextMenuItem[];
  "aria-label"?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function ContextMenuButton({
  items,
  "aria-label": ariaLabel = "Меню",
  align = "end",
  triggerClassName,
  contentClassName,
  size = "icon-sm",
}: ContextMenuButtonProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            className={triggerClassName}
            aria-label={ariaLabel}
            type="button"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className={cn(contentClassName)}>
        {items.map((item) => (
          <DropdownMenuItem key={item.label} variant={item.variant} onClick={item.onClick}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
