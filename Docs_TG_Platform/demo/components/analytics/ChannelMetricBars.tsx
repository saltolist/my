"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  buildChannelMetricSummaries,
  buildChannelTrendSeries,
  type ChannelMetricSummary,
} from "@/lib/channelAnalyticsTrend";

export default function ChannelMetricBars({ periodIndex }: { periodIndex: number }) {
  const { series } = useMemo(() => buildChannelTrendSeries(periodIndex), [periodIndex]);
  const metrics = useMemo(
    () => buildChannelMetricSummaries(series, periodIndex),
    [series, periodIndex],
  );

  return (
    <>
      <div className="section-title">Прирост по метрикам</div>
      <div className="channel-metrics-block">
        <div className="channel-metrics-head">
          <span>Метрика</span>
          <span>Прирост</span>
        </div>
        {metrics.map((metric) => (
          <ChannelMetricBarRow key={metric.id} metric={metric} />
        ))}
      </div>
    </>
  );
}

function ChannelMetricBarRow({ metric }: { metric: ChannelMetricSummary }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const fillPercent = Math.max(4, metric.growthShare);

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    const tooltipWidth = 190;
    const x = Math.min(clientX + 14, window.innerWidth - tooltipWidth - 8);
    const y = Math.max(clientY - 12, 8);
    setTooltipPos({ x, y });
  };

  return (
    <div className="bar-row channel-metric-bar">
      <div className="bar-label">
        <span>{metric.label}</span>
      </div>
      <div
        className="bar-track model-usage-track channel-metric-track"
        tabIndex={0}
        style={{ "--fill-width": `${fillPercent}%` } as CSSProperties}
        onMouseEnter={(event) => updateTooltipPosition(event.clientX, event.clientY)}
        onMouseMove={(event) => updateTooltipPosition(event.clientX, event.clientY)}
        onMouseLeave={() => setTooltipPos(null)}
        onFocus={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 12 });
        }}
        onBlur={() => setTooltipPos(null)}
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
      {tooltipPos ? (
        <div
          className="model-usage-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <b>{metric.label}</b>
          <span>Прирост: {metric.displayGrowth}</span>
          <span>Доля за период: {metric.growthShare}%</span>
        </div>
      ) : null}
      <div className="channel-metric-value delta-up">{metric.displayGrowth}</div>
    </div>
  );
}
