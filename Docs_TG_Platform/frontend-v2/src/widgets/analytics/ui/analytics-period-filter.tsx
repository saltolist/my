"use client";

import type { AnalyticsPeriod } from "@/shared/types";
import { FilterTabs } from "@/shared/ui/filter-tabs";

const PERIOD_OPTIONS = [
  { value: "24h" as const, label: "24 ч" },
  { value: "7d" as const, label: "7 дн" },
  { value: "30d" as const, label: "30 дн" },
  { value: "90d" as const, label: "90 дн" },
  { value: "all" as const, label: "Всё время" },
];

type AnalyticsPeriodFilterProps = {
  value: AnalyticsPeriod;
  onChange: (value: AnalyticsPeriod) => void;
};

export function AnalyticsPeriodFilter({ value, onChange }: AnalyticsPeriodFilterProps) {
  return (
    <FilterTabs
      value={value}
      options={PERIOD_OPTIONS}
      onChange={onChange}
      ariaLabel="Период аналитики"
    />
  );
}
