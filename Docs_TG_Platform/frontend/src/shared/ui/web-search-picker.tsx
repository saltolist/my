"use client";

import { Search } from "lucide-react";

import { ModelPicker, type ModelPickerOption } from "@/shared/ui/model-picker";

type WebSearchPickerProps = {
  label?: string;
  options: ModelPickerOption[];
  value: string;
  onChange: (id: string) => void;
  emptyLabel?: string;
};

export function WebSearchPicker({
  label = "Web Search",
  options,
  value,
  onChange,
  emptyLabel = "Нет",
}: WebSearchPickerProps) {
  return (
    <ModelPicker
      label={label}
      icon={<Search className="size-3.5" />}
      options={options}
      value={value}
      onChange={onChange}
      emptyLabel={emptyLabel}
    />
  );
}
