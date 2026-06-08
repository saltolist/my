"use client";

import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type ModelPickerOption = {
  id: string;
  label: string;
};

type ModelPickerProps = {
  label: string;
  icon: ReactNode;
  options: ModelPickerOption[];
  value: string;
  onChange: (id: string) => void;
  emptyLabel?: string;
};

export function ModelPicker({
  label,
  icon,
  options,
  value,
  onChange,
  emptyLabel,
}: ModelPickerProps) {
  const selected = options.find((o) => o.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" type="button">
            {icon}
            <span className="max-w-[120px] truncate">{selected?.label ?? emptyLabel ?? label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {options.map((opt) => (
          <DropdownMenuItem key={opt.id} onClick={() => onChange(opt.id)}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
