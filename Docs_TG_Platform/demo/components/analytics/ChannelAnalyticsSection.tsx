"use client";

import { useMemo } from "react";
import ChartSeriesSelector from "@/components/charts/ChartSeriesSelector";
import MultiSeriesTrendChart from "@/components/charts/MultiSeriesTrendChart";
import ChannelMetricBars from "@/components/analytics/ChannelMetricBars";
import ChannelReactionsPanel from "@/components/analytics/ChannelReactionsPanel";
import {
  ANALYTICS_SCREEN_PERIOD_TO_CHART,
  buildChannelTrendSeries,
  formatChannelGrowthPercent,
  formatChannelGrowthPrimary,
} from "@/lib/channelAnalyticsTrend";
import { useChartSeriesVisibility } from "@/lib/hooks/useChartSeriesVisibility";

export default function ChannelAnalyticsSection({ periodIndex }: { periodIndex: number }) {
  const chartPeriod = ANALYTICS_SCREEN_PERIOD_TO_CHART[periodIndex] ?? 1;
  const { labels, series } = useMemo(
    () => buildChannelTrendSeries(periodIndex),
    [periodIndex],
  );
  const seriesIds = useMemo(() => series.map((row) => row.id), [series]);
  const { isVisible, setVisible, filterSeries } = useChartSeriesVisibility(seriesIds);
  const visibleSeries = useMemo(() => filterSeries(series), [filterSeries, series]);
  const selectorItems = useMemo(
    () => series.map((row) => ({ id: row.id, label: row.label, color: row.color })),
    [series],
  );

  return (
    <>
      <div className="analytics-card analytics-chart-card profile-checkbox-scope">
        <div className="analytics-chart-head">
          <div className="section-title">Динамика прироста</div>
          <ChartSeriesSelector
            label="Метрики"
            items={selectorItems}
            isVisible={isVisible}
            onVisibleChange={setVisible}
          />
        </div>
        <MultiSeriesTrendChart
          labels={labels}
          series={visibleSeries}
          period={chartPeriod}
          compactAxisLabels={chartPeriod === 2 || chartPeriod === 3 || chartPeriod === 4}
          title="Динамика прироста по метрикам канала"
          formatAxisValue={(value) => `${Math.round(value)}%`}
          getDotGrowthBadge={(row, value, pointIndex) =>
            formatChannelGrowthPercent(row.id, value, pointIndex, row.values)
          }
          getDotPrimaryLine={(row, value, pointIndex) =>
            formatChannelGrowthPrimary(row.id, value, pointIndex, row.values)
          }
        />
      </div>

      <div className="analytics-metrics-row">
        <div className="analytics-card">
          <ChannelMetricBars periodIndex={periodIndex} />
        </div>
        <div className="analytics-card channel-reactions-card">
          <ChannelReactionsPanel />
        </div>
      </div>
    </>
  );
}
