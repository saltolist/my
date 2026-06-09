"use client";

import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type BackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export function BackButton({ onClick, label = "Назад", className }: BackButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className={cn("shrink-0", className)}>
      <ArrowLeftIcon />
      {label}
    </Button>
  );
}
