"use client";

import { useMemo, useState, type CSSProperties, type FocusEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
  buildChannelMetricSummaries,
  buildChannelTrendSeries,
  type ChannelMetricSummary,
} from "@/lib/channelAnalyticsTrend";
import { useAnchoredBarRowTooltip } from "@/lib/hooks/useAnchoredBarRowTooltip";
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

function ChannelMetricTooltipBody({ metric }: { metric: ChannelMetricSummary }) {
  return (
    <>
      <b>{metric.label}</b>
      <span>
        Прирост: {metric.displayGrowth} {metric.displayGrowthRelativePercent}
      </span>
      <span>Количество: {metric.displayQuantity}</span>
    </>
  );
}

function ChannelMetricBarRow({ metric }: { metric: ChannelMetricSummary }) {
  const isMobile = useMobile760();
  const { rowRef, open, mobileHandlers } = useAnchoredBarRowTooltip(isMobile);
  const [desktopTooltipPos, setDesktopTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const fillPercent = metric.barFillPercent;

  const desktopTooltipHandlers = {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setDesktopTooltipPos({ x: event.clientX, y: rect.top });
    },
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setDesktopTooltipPos({ x: event.clientX, y: rect.top });
    },
    onMouseLeave: () => setDesktopTooltipPos(null),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setDesktopTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    },
    onBlur: () => setDesktopTooltipPos(null),
  };

  return (
    <div
      ref={rowRef}
      className={`bar-row channel-metric-bar${open && isMobile ? " bar-row--tooltip-open" : ""}`}
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
      <div className="channel-metric-bar-zone">
        <div
          className="bar-track model-usage-track channel-metric-track"
          tabIndex={isMobile ? undefined : 0}
          style={{ "--fill-width": `${fillPercent}%` } as CSSProperties}
          {...(isMobile ? {} : desktopTooltipHandlers)}
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
