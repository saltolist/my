"use client";

import { useMemo, useState, type CSSProperties, type FocusEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
  buildChannelMetricSummaries,
  buildChannelTrendSeries,
  type ChannelMetricSummary,
} from "@/lib/channelAnalyticsTrend";
import { useMobile760 } from "@/lib/hooks/useMobile760";

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
    <div
      className="channel-metrics-block"
      style={{ "--channel-metric-rows": metrics.length } as CSSProperties}
    >
      <div className="channel-metrics-head">
        <span>Метрика</span>
        <span className="channel-metrics-head-bar" aria-hidden />
        <span>Прирост</span>
        <span>Количество</span>
      </div>
      <div
        className="channel-metrics-rows"
        style={
          {
            gridTemplateRows: `repeat(${metrics.length}, minmax(0, 1fr))`,
          } as CSSProperties
        }
      >
        {metrics.map((metric) => (
          <ChannelMetricBarRow key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function ChannelMetricBarRow({ metric }: { metric: ChannelMetricSummary }) {
  const isMobile = useMobile760();
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const fillPercent = Math.max(4, metric.growthShare);

  const updateTooltipPosition = (clientX: number, anchorY: number) => {
    setTooltipPos({ x: clientX, y: anchorY });
  };

  const tooltipHandlers = {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      updateTooltipPosition(event.clientX, rect.top);
    },
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      updateTooltipPosition(event.clientX, rect.top);
    },
    onMouseLeave: () => setTooltipPos(null),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    },
    onBlur: () => setTooltipPos(null),
  };

  return (
    <div
      className="bar-row channel-metric-bar"
      style={{ "--bar-row-color": metric.color } as CSSProperties}
    >
      <div
        className="bar-label"
        tabIndex={isMobile ? 0 : undefined}
        {...(isMobile ? tooltipHandlers : {})}
      >
        <span>{metric.label}</span>
      </div>
      <div className="channel-metric-bar-zone">
        <div
          className="bar-track model-usage-track channel-metric-track"
          tabIndex={isMobile ? undefined : 0}
          style={{ "--fill-width": `${fillPercent}%` } as CSSProperties}
          {...(isMobile ? {} : tooltipHandlers)}
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
      <div className="channel-metric-value channel-metric-value--growth">{metric.displayGrowth}</div>
      <div className="channel-metric-value channel-metric-value--quantity">
        {metric.displayQuantity}
      </div>
      {tooltipPos && typeof document !== "undefined"
        ? createPortal(
            <div
              className="model-usage-tooltip"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <b>{metric.label}</b>
              <span>Прирост: {metric.displayGrowth}</span>
              <span>Количество: {metric.displayQuantity}</span>
              <span>Доля за период: {metric.growthShare}%</span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
