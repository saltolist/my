"use client";

import { ChevronDownIcon } from "lucide-react";

import { MOBILE_MAX_MQ, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type FilterTabOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterTabsProps<T extends string> = {
  value: T;
  options: readonly FilterTabOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

export function FilterTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel = "Фильтр",
  className,
}: FilterTabsProps<T>) {
  const isMobile = useMediaQuery(MOBILE_MAX_MQ);
  const activeLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5 font-normal", className)}
              aria-label={ariaLabel}
            />
          }
        >
          <span>{activeLabel}</span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[10rem]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(value === option.value && "bg-accent")}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1", className)}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
