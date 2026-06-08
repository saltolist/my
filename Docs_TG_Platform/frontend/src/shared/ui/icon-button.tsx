import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type IconButtonProps = {
  onClick?: () => void;
  "aria-label": string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export function IconButton({
  onClick,
  "aria-label": ariaLabel,
  children,
  className,
  disabled,
  type = "button",
}: IconButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
