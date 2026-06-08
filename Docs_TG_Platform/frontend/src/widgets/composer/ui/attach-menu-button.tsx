"use client";

import { Plus } from "lucide-react";

import { IconButton } from "@/shared/ui/icon-button";

type AttachMenuButtonProps = {
  onClick?: () => void;
};

export function AttachMenuButton({ onClick }: AttachMenuButtonProps) {
  return (
    <IconButton aria-label="Добавить" onClick={onClick}>
      <Plus className="size-4" />
    </IconButton>
  );
}
