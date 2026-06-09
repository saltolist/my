"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

export type ModeClusterProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  onAdd?: () => void;
  addLabel?: string;
  icon?: React.ReactNode;
};

export function ModeCluster({ label, active, onClick, onAdd, addLabel, icon }: ModeClusterProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="sm"
        onClick={onClick}
        className="gap-1.5"
      >
        {icon}
        {label}
      </Button>
      {active && onAdd ? (
        <IconButton aria-label={addLabel ?? "Добавить"} onClick={onAdd}>
          <PlusIcon className="size-3.5" />
        </IconButton>
      ) : null}
    </div>
  );
}
