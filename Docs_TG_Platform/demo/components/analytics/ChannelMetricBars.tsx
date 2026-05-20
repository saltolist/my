"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  buildChannelMetricSummaries,
  buildChannelTrendSeries,
  type ChannelMetricSummary,
} from "@/lib/channelAnalyticsTrend";

type ChannelMetricBarsProps = {
  periodIndex: number;
};

export default function ChannelMetricBars({ periodIndex }: ChannelMetricBarsProps) {
  const { series } = useMemo(() => buildChannelTrendSeries(periodIndex), [periodIndex]);
  const metrics = useMemo(
    () => buildChannelMetricSummaries(series, periodIndex),
    [series, periodIndex],
  );

  return (
    <div className="channel-metrics-block">
        <div className="channel-metrics-head">
          <span>Метрика</span>
          <span className="channel-metrics-head-bar" aria-hidden />
          <span>Прирост</span>
        </div>
        {metrics.map((metric) => (
          <ChannelMetricBarRow key={metric.id} metric={metric} />
        ))}
    </div>
  );
}

function ChannelMetricBarRow({ metric }: { metric: ChannelMetricSummary }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const fillPercent = Math.max(4, metric.growthShare);

  const updateTooltipPosition = (clientX: number, anchorY: number) => {
    setTooltipPos({ x: clientX, y: anchorY });
  };

  return (
    <div className="bar-row channel-metric-bar">
      <div className="bar-label">
        <span>{metric.label}</span>
      </div>
      <div className="channel-metric-bar-zone">
        <div
          className="bar-track model-usage-track channel-metric-track"
          tabIndex={0}
          style={{ "--fill-width": `${fillPercent}%` } as CSSProperties}
          onMouseEnter={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            updateTooltipPosition(event.clientX, rect.top);
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            updateTooltipPosition(event.clientX, rect.top);
          }}
          onMouseLeave={() => setTooltipPos(null)}
          onFocus={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
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
      </div>
      <div className="channel-metric-value">{metric.displayGrowth}</div>
      {tooltipPos && typeof document !== "undefined"
        ? createPortal(
            <div
              className="model-usage-tooltip"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <b>{metric.label}</b>
              <span>Прирост: {metric.displayGrowth}</span>
              <span>Доля за период: {metric.growthShare}%</span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
