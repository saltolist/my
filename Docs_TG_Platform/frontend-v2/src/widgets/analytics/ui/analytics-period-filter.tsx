"use client";

import {
  ANALYTICS_PERIOD_OPTIONS,
  type AnalyticsPeriod,
} from "@/shared/data/analytics-seed";
import { FilterTabs } from "@/shared/ui/filter-tabs";

type AnalyticsPeriodFilterProps = {
  value: AnalyticsPeriod;
  onChange: (value: AnalyticsPeriod) => void;
};

export function AnalyticsPeriodFilter({ value, onChange }: AnalyticsPeriodFilterProps) {
  return (
    <FilterTabs
      value={value}
      options={ANALYTICS_PERIOD_OPTIONS}
      onChange={onChange}
      ariaLabel="Период аналитики"
    />
  );
}
