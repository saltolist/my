"use client";

import { useMemo } from "react";
import MultiSeriesTrendChart from "@/components/charts/MultiSeriesTrendChart";
import {
  ANALYTICS_SCREEN_PERIOD_TO_CHART,
  buildChannelTrendSeries,
  formatChannelGrowthBadge,
  formatChannelGrowthPrimary,
  formatChannelPointPercentGrowth,
} from "@/lib/channelAnalyticsTrend";
import { formatTrendChartRangeFromStart } from "@/lib/trendChart/periodLabels";

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
      compactAxisLabels={chartPeriod === 0 || chartPeriod === 2 || chartPeriod === 3 || chartPeriod === 4}
      showYAxisLabels={false}
      title="Динамика прироста по метрикам канала"
      getDotGrowthBadge={(row, value, pointIndex) =>
        formatChannelGrowthBadge(
          row.id,
          value,
          pointIndex,
          row.values,
          row.priorCumulative ?? 0,
        )
      }
      getDotPrimaryLine={(row, value, pointIndex) =>
        formatChannelGrowthPrimary(row.id, value, pointIndex, row.values, row.priorCumulative ?? 0)
      }
      getDotRangeFromStartLine={(_, __, pointIndex) =>
        formatTrendChartRangeFromStart(chartPeriod, pointIndex, labels.length)
      }
      getDotPercentGrowthLine={(row, _, pointIndex) =>
        formatChannelPointPercentGrowth(
          row.id,
          pointIndex,
          row.values,
          row.priorCumulative ?? 0,
        )
      }
    />
  );
}
