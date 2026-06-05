"use client";

import { useMemo, useState } from "react";
import type { TrendSeriesRow } from "@/components/charts/MultiSeriesTrendChart";
import { useChartSeriesVisibility } from "@/lib/hooks/useChartSeriesVisibility";
import { usePageHeaderLe1080 } from "@/lib/hooks/usePageHeaderLe1080";
import { usePageHeaderLe640 } from "@/lib/hooks/usePageHeaderLe640";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { PLATFORM_ANALYTICS_PERIODS } from "@/lib/platformAnalyticsPeriods";
import {
  PLATFORM_MODEL_FILTERS,
  type ModelFilterId,
} from "@/lib/platformModelFilters";
import {
  buildModelUsage,
  buildTypeUsage,
  getTrendPointCost,
  summarizeModelUsage,
} from "@/lib/profile/platformAnalytics";
import {
  getPeriodChartLabels,
  resolveTrendChartMaxPoints,
} from "@/lib/trendChart/periodLabels";
import { useDomain } from "@/state/domain-store";

type Args = {
  period: number;
  onPeriodChange: (next: number) => void;
  periodInHeader?: boolean;
};

export function usePlatformAnalyticsBlock({
  period,
  onPeriodChange,
  periodInHeader = false,
}: Args) {
  const { state } = useDomain();
  const isMobile = useMobile760();
  const isHeaderLe1080 = usePageHeaderLe1080();
  const isHeaderLe640 = usePageHeaderLe640();
  const [modelType, setModelType] = useState<ModelFilterId>("all");

  const chartMaxPoints = resolveTrendChartMaxPoints({
    isMobile,
    isHeaderLe1080,
    isHeaderLe640,
  });

  const chartLabels = useMemo(
    () => getPeriodChartLabels(period, { maxPoints: chartMaxPoints }),
    [period, chartMaxPoints],
  );

  const modelUsage = useMemo(
    () =>
      buildModelUsage(
        state.aiProfileConfig,
        PLATFORM_ANALYTICS_PERIODS[period].multiplier,
        chartLabels.length,
      ),
    [state.aiProfileConfig, period, chartLabels.length],
  );

  const selectedTypeMeta =
    PLATFORM_MODEL_FILTERS.find((type) => type.id === modelType) ?? PLATFORM_MODEL_FILTERS[0];
  const isAllTypes = modelType === "all";
  const selectedModels = isAllTypes
    ? buildTypeUsage(modelUsage)
    : modelUsage.filter((model) => model.type === modelType);
  const modelTotals = summarizeModelUsage(selectedModels);

  const costTrendSeries = useMemo(
    (): TrendSeriesRow[] =>
      selectedModels.map((model) => ({
        id: model.id,
        label: model.label,
        color: model.color,
        values: model.trend,
        yValues: model.trend.map((_, index) => getTrendPointCost(model, index)),
      })),
    [selectedModels],
  );

  const seriesIds = useMemo(() => selectedModels.map((model) => model.id), [selectedModels]);
  const { isVisible, setVisible, filterSeries } = useChartSeriesVisibility(seriesIds);
  const visibleCostTrendSeries = useMemo(
    () => filterSeries(costTrendSeries),
    [costTrendSeries, filterSeries],
  );

  const selectorItems = useMemo(
    () =>
      selectedModels.map((model) => ({
        id: model.id,
        label: model.label,
        color: model.color,
      })),
    [selectedModels],
  );

  const chartTitle = `Динамика стоимости: ${selectedTypeMeta.label}`;

  return {
    period,
    onPeriodChange,
    periodInHeader,
    modelType,
    setModelType,
    isAllTypes,
    selectedTypeMeta,
    modelTotals,
    chartLabels,
    chartTitle,
    selectedModels,
    visibleCostTrendSeries,
    selectorItems,
    isVisible,
    setVisible,
    compactAxisLabels: period === 0 || period === 2 || period === 3,
  };
}
