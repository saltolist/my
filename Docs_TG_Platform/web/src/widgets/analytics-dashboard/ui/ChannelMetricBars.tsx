"use client";

import { useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  buildChannelMetricSummaries,
  buildChannelTrendSeries,
  type ChannelMetricSummary,
} from "@/shared/lib/channelAnalyticsTrend";
import { resolveTrendChartMaxPoints } from "@/shared/lib/trendChart/periodLabels";
import { useAnchoredBarRowTooltip } from "@/shared/lib/hooks/useAnchoredBarRowTooltip";
import { useDesktopBarTooltipPortal } from "@/shared/lib/hooks/useDesktopBarTooltipPortal";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { usePageHeaderLe1080, usePageHeaderLe640 } from "@/widgets/page-header";

type ChannelMetricBarsProps = {
  periodIndex: number;
};

export default function ChannelMetricBars({ periodIndex }: ChannelMetricBarsProps) {
  const isMobile = useMobile760();
  const isHeaderLe1080 = usePageHeaderLe1080();
  const isHeaderLe640 = usePageHeaderLe640();
  const chartMaxPoints = resolveTrendChartMaxPoints({
    isMobile,
    isHeaderLe1080,
    isHeaderLe640,
  });
  const { series } = useMemo(
    () => buildChannelTrendSeries(periodIndex, { maxPoints: chartMaxPoints }),
    [periodIndex, chartMaxPoints],
  );
  const metrics = useMemo(
    () => buildChannelMetricSummaries(series, periodIndex),
    [series, periodIndex],
  );

  return (
    <div
      className={`channel-metrics-grid model-usage-grid${isMobile ? " channel-metrics-grid--mobile" : ""}`}
      style={{ "--channel-metric-rows": metrics.length } as CSSProperties}
    >
      <div className="model-usage-head channel-metrics-head">
        <span>Метрика</span>
        {!isMobile ? <span className="model-usage-head-bar" aria-hidden /> : null}
        <span>Прирост</span>
        <span>Количество</span>
      </div>
      {metrics.map((metric) => (
        <ChannelMetricBarRow key={metric.id} metric={metric} isMobile={isMobile} />
      ))}
    </div>
  );
}

function ChannelMetricTooltipBody({ metric }: { metric: ChannelMetricSummary }) {
  return (
    <>
      <b>{metric.label}</b>
      <span>Прирост: {metric.displayGrowth}</span>
      <span>Количество: {metric.displayQuantity}</span>
      <span>
        Ср. прирост за период: {metric.displayPeriodAverageGrowth}
      </span>
    </>
  );
}

function ChannelMetricBarRow({
  metric,
  isMobile,
}: {
  metric: ChannelMetricSummary;
  isMobile: boolean;
}) {
  const { rowRef, open, mobileHandlers } = useAnchoredBarRowTooltip(isMobile);
  const { desktopTooltipPos, desktopTooltipHandlers } = useDesktopBarTooltipPortal(!isMobile);
  const fillPercent = metric.barFillPercent;

  return (
    <div
      ref={rowRef}
      className={`bar-row model-usage-bar channel-metric-row${open && isMobile ? " channel-metric-row--tooltip-open" : ""}`}
      style={{ "--bar-row-color": metric.color } as CSSProperties}
      tabIndex={isMobile ? 0 : undefined}
      aria-expanded={isMobile ? open : undefined}
      {...(isMobile ? mobileHandlers : {})}
    >
      <div className="bar-label">
        <span className="bar-label-text-clip">{metric.label}</span>
        {isMobile && open ? (
          <div className="model-usage-tooltip model-usage-tooltip--anchored-row">
            <ChannelMetricTooltipBody metric={metric} />
          </div>
        ) : null}
      </div>
      {!isMobile ? (
        <div
          className="bar-track model-usage-track channel-metric-track"
          tabIndex={0}
          style={{ "--fill-width": `${fillPercent}%` } as CSSProperties}
          {...desktopTooltipHandlers}
        >
          <div
            className="bar-fill"
            style={
              {
                "--fill-width": `${fillPercent}%`,
                "--bar-color": metric.color,
                backgroundColor: metric.color,
              } as CSSProperties
            }
          />
        </div>
      ) : null}
      <div className="channel-metric-value channel-metric-value--growth">
        {metric.displayGrowth}
      </div>
      <div className="channel-metric-value channel-metric-value--quantity">
        {metric.displayQuantity}
      </div>
      {!isMobile && desktopTooltipPos && typeof document !== "undefined"
        ? createPortal(
            <div
              className="model-usage-tooltip"
              style={{ left: desktopTooltipPos.x, top: desktopTooltipPos.y }}
            >
              <ChannelMetricTooltipBody metric={metric} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
