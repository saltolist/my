"use client";

import { useMemo, type CSSProperties } from "react";
import ChartSeriesSelector from "@/components/charts/ChartSeriesSelector";
import MultiSeriesTrendChart from "@/components/charts/MultiSeriesTrendChart";
import ChannelMetricBars from "@/components/analytics/ChannelMetricBars";
import ChannelReactionsPanel from "@/components/analytics/ChannelReactionsPanel";
import ModelPicker from "@/components/composer/ModelPicker";
import {
  ANALYTICS_SCREEN_PERIOD_TO_CHART,
  buildChannelSummaryCards,
  buildChannelTrendSeries,
  formatChannelGrowthBadge,
  formatChannelGrowthPrimary,
  formatChannelPointPercentGrowth,
} from "@/lib/channelAnalyticsTrend";
import {
  formatTrendChartRangeFromStart,
  resolveTrendChartMaxPoints,
} from "@/lib/trendChart/periodLabels";
import { useChartSeriesVisibility } from "@/lib/hooks/useChartSeriesVisibility";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePageHeaderLe1080 } from "@/lib/hooks/usePageHeaderLe1080";

export default function ChannelAnalyticsSection({
  periodIndex,
  periods,
  onPeriodChange,
}: {
  periodIndex: number;
  periods: string[];
  onPeriodChange: (next: number) => void;
}) {
  const isMobile = useMobile760();
  const isHeaderLe1080 = usePageHeaderLe1080();
  const chartMaxPoints = resolveTrendChartMaxPoints({
    isMobile,
    isHeaderLe1080,
  });
  const chartPeriod = ANALYTICS_SCREEN_PERIOD_TO_CHART[periodIndex] ?? 1;
  const { labels, series } = useMemo(
    () => buildChannelTrendSeries(periodIndex, { maxPoints: chartMaxPoints }),
    [periodIndex, chartMaxPoints],
  );
  const seriesIds = useMemo(() => series.map((row) => row.id), [series]);
  const { isVisible, setVisible, filterSeries } = useChartSeriesVisibility(seriesIds);
  const visibleSeries = useMemo(() => filterSeries(series), [filterSeries, series]);
  const selectorItems = useMemo(
    () => series.map((row) => ({ id: row.id, label: row.label, color: row.color })),
    [series],
  );
  const summaryCards = useMemo(
    () => buildChannelSummaryCards(series, periodIndex),
    [series, periodIndex],
  );

  return (
    <>
      <div className="analytics-card analytics-chart-card platform-analytics-section profile-checkbox-scope">
        <div className="analytics-card-head">
          <div className="profile-section-title">Динамика прироста</div>
          <div className="analytics-channel-head-filters model-filter-stack model-filter-stack--with-series">
            {!isMobile ? (
              <ModelPicker
                ariaLabel="Период"
                className="profile-model-picker analytics-period-picker"
                value={String(periodIndex)}
                options={periods.map((label, index) => ({ id: String(index), label }))}
                placement="down"
                dropdownClassName="model-picker-dropdown--page-header"
                onChange={(id) => onPeriodChange(Number(id))}
              />
            ) : null}
            <ChartSeriesSelector
              variant="profile"
              label="Метрики"
              items={selectorItems}
              isVisible={isVisible}
              onVisibleChange={setVisible}
            />
          </div>
        </div>
        {summaryCards.length > 0 ? (
          <div
            className="model-analytics-summary channel-analytics-summary"
            style={{ "--summary-cols": series.length } as CSSProperties}
          >
            {summaryCards.map((card) => (
              <div className="mini-metric channel-mini-metric" key={card.id}>
                <div className="mini-metric-value">{card.value}</div>
                <div className="mini-metric-label">{`${card.label}  ${card.displayGrowth}`}</div>
              </div>
            ))}
          </div>
        ) : null}
        <MultiSeriesTrendChart
          labels={labels}
          series={visibleSeries}
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
            formatChannelGrowthPrimary(
              row.id,
              value,
              pointIndex,
              row.values,
              row.priorCumulative ?? 0,
            )
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
      </div>

      <div className="analytics-metrics-row">
        <div className="analytics-card platform-analytics-section analytics-metrics-card">
          <div className="analytics-metrics-card-title">Прирост по метрикам</div>
          <div className="analytics-metrics-card-body">
            <ChannelMetricBars periodIndex={periodIndex} />
          </div>
        </div>
        <div className="analytics-card channel-reactions-card platform-analytics-section analytics-metrics-card">
          <div className="analytics-metrics-card-title">Реакции</div>
          <div className="analytics-metrics-card-body">
            <ChannelReactionsPanel />
          </div>
        </div>
      </div>
    </>
  );
}
