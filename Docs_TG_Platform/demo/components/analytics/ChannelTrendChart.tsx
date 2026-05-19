"use client";

import { useMemo } from "react";
import MultiSeriesTrendChart from "@/components/charts/MultiSeriesTrendChart";
import {
  ANALYTICS_SCREEN_PERIOD_TO_CHART,
  buildChannelTrendSeries,
  formatChannelGrowthPrimary,
} from "@/lib/channelAnalyticsTrend";

export default function ChannelTrendChart({ periodIndex }: { periodIndex: number }) {
  const chartPeriod = ANALYTICS_SCREEN_PERIOD_TO_CHART[periodIndex] ?? 1;
  const { labels, series } = useMemo(
    () => buildChannelTrendSeries(periodIndex),
    [periodIndex],
  );

  return (
    <MultiSeriesTrendChart
      labels={labels}
      series={series}
      period={chartPeriod}
      compactAxisLabels={chartPeriod === 2 || chartPeriod === 3 || chartPeriod === 4}
      title="Динамика прироста по метрикам канала"
      formatAxisValue={(value) => `${Math.round(value)}%`}
      getDotPrimaryLine={(row, value, pointIndex) =>
        formatChannelGrowthPrimary(row.id, value, pointIndex, row.values)
      }
    />
  );
}
