"use client";

import { ArrowUpIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export type PostJumpButtonProps = {
  onClick: () => void;
  visible?: boolean;
  className?: string;
};

export function PostJumpButton({ onClick, visible = true, className }: PostJumpButtonProps) {
  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("shrink-0", className)}
    >
      <ArrowUpIcon />
      К посту
    </Button>
  );
}
