"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import {
  TREND_CHART_HEIGHT_PX,
  TREND_CHART_WIDTH,
  TREND_DOT_CLUSTER_FALLBACK_WIDTH_PX,
  TREND_DOT_CORE_DIAMETER_PX,
  buildAdaptiveValueScale,
  buildSmoothPath,
  buildTrendLineGradientStops,
  computeClusterStripLeft,
  formatTrendNumber,
  getClusterStripColumnCount,
  sanitizeSvgId,
  valueToChartY,
} from "@/lib/trendChart/math";
import {
  formatTrendPointPeriod,
  getTrendPointXPercent,
} from "@/lib/trendChart/periodLabels";

export type TrendSeriesRow = {
  id: string;
  label: string;
  color: string;
  values: number[];
  yValues?: number[];
  /** Накопительное значение на момент перед первой точкой графика (пред. день/час). */
  priorCumulative?: number;
};

export type TrendChartDot = {
  seriesId: string;
  seriesLabel: string;
  color: string;
  x: number;
  y: number;
  value: number;
  label: string;
  pointIndex: number;
  periodLabel: string;
  extraLines: string[];
};

type TrendDotCluster = {
  id: string;
  dots: TrendChartDot[];
  x: number;
  y: number;
};

type TrendChartDotView = TrendChartDot & {
  clusterId: string;
  clusterSize: number;
};

function trendDotCenterDistancePx(
  a: { x: number; y: number },
  b: { x: number; y: number },
  chartWidthPx: number,
  chartHeightPx: number,
) {
  const widthPx = chartWidthPx > 0 ? chartWidthPx : TREND_DOT_CLUSTER_FALLBACK_WIDTH_PX;
  const heightPx = chartHeightPx > 0 ? chartHeightPx : TREND_CHART_HEIGHT_PX;
  const dxPx = (Math.abs(b.x - a.x) / 100) * widthPx;
  const dyPx = (Math.abs(b.y - a.y) / 100) * heightPx;
  return Math.hypot(dxPx, dyPx);
}

function groupOverlappingTrendDots(
  dots: TrendChartDot[],
  chartWidthPx: number,
  chartHeightPx: number,
): TrendDotCluster[] {
  if (dots.length === 0) return [];

  const used = new Set<number>();
  const clusters: TrendChartDot[][] = [];

  for (let i = 0; i < dots.length; i += 1) {
    if (used.has(i)) continue;

    const cluster: TrendChartDot[] = [dots[i]];
    used.add(i);

    let grew = true;
    while (grew) {
      grew = false;
      for (let j = 0; j < dots.length; j += 1) {
        if (used.has(j)) continue;
        const touchesCluster = cluster.some(
          (member) =>
            trendDotCenterDistancePx(member, dots[j], chartWidthPx, chartHeightPx) <=
            TREND_DOT_CORE_DIAMETER_PX,
        );
        if (!touchesCluster) continue;
        cluster.push(dots[j]);
        used.add(j);
        grew = true;
      }
    }

    clusters.push(cluster);
  }

  return clusters.map((clusterDots, index) => {
    const xs = clusterDots.map((dot) => dot.x);
    const ys = clusterDots.map((dot) => dot.y);

    return {
      id: `cluster-${index}-${clusterDots.map((dot) => `${dot.seriesId}:${dot.label}`).join("|")}`,
      dots: clusterDots,
      x: xs.reduce((sum, value) => sum + value, 0) / clusterDots.length,
      y: ys.reduce((sum, value) => sum + value, 0) / clusterDots.length,
    };
  });
}

function trendDotKey(dot: Pick<TrendChartDot, "seriesId" | "label">) {
  return `${dot.seriesId}:${dot.label}`;
}

function shouldClearTrendDotHover(event: MouseEvent<HTMLButtonElement>) {
  const related = event.relatedTarget;
  const chartWrap = event.currentTarget.closest(".trend-chart-wrap");
  if (related instanceof Node && chartWrap?.contains(related)) {
    if (related instanceof Element && related.closest(".trend-html-dot")) {
      return false;
    }
  }
  return true;
}

function collectYValues(series: TrendSeriesRow[], pointCount: number) {
  return series.flatMap((row) =>
    Array.from({ length: pointCount }, (_, index) => row.yValues?.[index] ?? row.values[index] ?? 0),
  );
}

export type MultiSeriesTrendChartProps = {
  labels: string[];
  series: TrendSeriesRow[];
  period: number;
  title: string;
  compactAxisLabels?: boolean;
  showYAxisLabels?: boolean;
  /** Доля отступа крайних точек от края plot (%); на десктопе 0. */
  pointEdgeInsetPercent?: number;
  formatAxisValue?: (value: number, scaleMax: number) => string;
  getDotPrimaryLine: (row: TrendSeriesRow, value: number, pointIndex: number) => string;
  getDotGrowthBadge?: (row: TrendSeriesRow, value: number, pointIndex: number) => string;
  getDotRangeFromStartLine?: (row: TrendSeriesRow, value: number, pointIndex: number) => string;
  getDotPercentGrowthLine?: (row: TrendSeriesRow, value: number, pointIndex: number) => string;
  getDotExtraLines?: (row: TrendSeriesRow, value: number, pointIndex: number) => string[];
};

function TrendTooltipBody({
  label,
  growth,
  periodLabel,
  primaryLine,
  rangeFromStart,
  percentGrowth,
  extraLines,
}: {
  label: string;
  growth?: string;
  periodLabel: string;
  primaryLine: string;
  rangeFromStart?: string;
  percentGrowth?: string;
  extraLines: string[];
}) {
  return (
    <>
      <TrendTooltipTitle label={label} growth={growth} />
      <span className="trend-tooltip-period">{periodLabel}</span>
      <em className="trend-tooltip-metric">{primaryLine}</em>
      {rangeFromStart ? <span className="trend-tooltip-range">{rangeFromStart}</span> : null}
      {percentGrowth ? <span className="trend-tooltip-percent">{percentGrowth}</span> : null}
      {extraLines.map((line) => (
        <em key={line}>{line}</em>
      ))}
    </>
  );
}

function TrendTooltipTitle({ label, growth }: { label: string; growth?: string }) {
  return (
    <div className="trend-tooltip-head">
      <b>{label}</b>
      {growth ? <span className="trend-tooltip-growth">{growth}</span> : null}
    </div>
  );
}

export default function MultiSeriesTrendChart({
  labels,
  series,
  period,
  title,
  compactAxisLabels = false,
  showYAxisLabels = true,
  pointEdgeInsetPercent = 0,
  formatAxisValue = formatTrendNumber,
  getDotPrimaryLine,
  getDotGrowthBadge,
  getDotRangeFromStartLine,
  getDotPercentGrowthLine,
  getDotExtraLines,
}: MultiSeriesTrendChartProps) {
  const isMobile = useMobile760();
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [hoveredDotKey, setHoveredDotKey] = useState<string | null>(null);
  const [clusterStripAnchor, setClusterStripAnchor] = useState<{
    left?: number;
    bottom: number;
  } | null>(null);
  const [clusterAnchor, setClusterAnchor] = useState<{ dotX: number } | null>(null);
  const clusterStripRef = useRef<HTMLDivElement>(null);
  const chartTop = 1;
  const chartBottom = 88;
  const chartHeight = chartBottom - chartTop;
  const valueScale = buildAdaptiveValueScale(collectYValues(series, labels.length));
  const midValue = valueScale.min + valueScale.span / 2;
  const gridRows = [
    { y: chartTop, label: formatAxisValue(valueScale.max, valueScale.max) },
    { y: (chartTop + chartBottom) / 2, label: formatAxisValue(midValue, valueScale.max) },
    { y: chartBottom, label: formatAxisValue(valueScale.min, valueScale.max) },
  ];

  const chartRows = series.map((row) => {
    const points = labels.map((_, i) => {
      const yValue = row.yValues?.[i] ?? row.values[i] ?? 0;
      const x =
        labels.length === 1
          ? TREND_CHART_WIDTH / 2
          : (getTrendPointXPercent(i, labels.length, pointEdgeInsetPercent) / 100) *
            TREND_CHART_WIDTH;
      const y = valueToChartY(yValue, valueScale, chartBottom, chartHeight);
      return { x, y };
    });

    const dots = labels.map((label, i) => {
      const value = row.values[i] ?? 0;
      const yValue = row.yValues?.[i] ?? value;
      return {
        x: getTrendPointXPercent(i, labels.length, pointEdgeInsetPercent),
        y: valueToChartY(yValue, valueScale, chartBottom, chartHeight),
        value,
        label,
        pointIndex: i,
        periodLabel: formatTrendPointPeriod(period, i, labels.length),
        extraLines: getDotExtraLines?.(row, value, i) ?? [],
      };
    });

    return { ...row, path: buildSmoothPath(points), dots };
  });

  const chartWrapRef = useRef<HTMLDivElement>(null);
  const dotClustersRef = useRef<TrendDotCluster[]>([]);
  const [chartSizePx, setChartSizePx] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = chartWrapRef.current;
    if (!node) return;

    const updateSize = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      setChartSizePx((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { chartDots, dotClusters } = useMemo(() => {
    const flatDots = chartRows.flatMap((row) =>
      row.dots.map((dot, index) => ({
        seriesId: row.id,
        seriesLabel: row.label,
        color: row.color,
        x: dot.x,
        y: dot.y,
        value: dot.value,
        label: dot.label ?? labels[index],
        pointIndex: dot.pointIndex ?? index,
        periodLabel: dot.periodLabel ?? formatTrendPointPeriod(period, index, labels.length),
        extraLines: dot.extraLines,
      })),
    );
    const clusters = groupOverlappingTrendDots(
      flatDots,
      chartSizePx.width,
      chartSizePx.height,
    );
    const clusterSizeById = new Map(clusters.map((cluster) => [cluster.id, cluster.dots.length]));
    const clusterIdByKey = new Map<string, string>();
    clusters.forEach((cluster) => {
      cluster.dots.forEach((dot) => clusterIdByKey.set(trendDotKey(dot), cluster.id));
    });

    return {
      dotClusters: clusters,
      chartDots: flatDots.map((dot) => {
        const clusterId = clusterIdByKey.get(trendDotKey(dot)) ?? "";
        return {
          ...dot,
          clusterId,
          clusterSize: clusterSizeById.get(clusterId) ?? 1,
        } satisfies TrendChartDotView;
      }),
    };
  }, [chartRows, labels, period, chartSizePx.height, chartSizePx.width]);

  dotClustersRef.current = dotClusters;

  const clearTrendHover = useCallback(() => {
    setHoveredClusterId(null);
    setHoveredDotKey(null);
    setClusterAnchor(null);
    setClusterStripAnchor(null);
    const wrap = chartWrapRef.current;
    const active = document.activeElement;
    if (active instanceof HTMLElement && wrap?.contains(active)) {
      active.blur();
    }
  }, []);

  useEffect(() => {
    if (!isMobile || !hoveredClusterId) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const wrap = chartWrapRef.current;
      const dotEl =
        target instanceof Element ? target.closest<HTMLButtonElement>(".trend-html-dot") : null;

      if (dotEl && wrap?.contains(dotEl)) {
        const dotKey = dotEl.getAttribute("data-trend-dot-key");
        const cluster = dotClustersRef.current.find((item) =>
          item.dots.some((dot) => trendDotKey(dot) === dotKey),
        );
        if (cluster?.id === hoveredClusterId) {
          clearTrendHover();
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      if (clusterStripRef.current?.contains(target)) return;

      clearTrendHover();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isMobile, hoveredClusterId, clearTrendHover]);

  const hoveredCluster = useMemo(
    () => dotClusters.find((cluster) => cluster.id === hoveredClusterId) ?? null,
    [dotClusters, hoveredClusterId],
  );

  const clusterStripSyncKey =
    hoveredClusterId && hoveredDotKey && clusterAnchor
      ? `${hoveredClusterId}\u0000${hoveredDotKey}\u0000${clusterAnchor.dotX}\u0000${chartSizePx.width}\u0000${chartSizePx.height}\u0000${hoveredCluster?.dots.length ?? 0}`
      : "";

  const hoveredLineHighlights = useMemo(() => {
    if (!hoveredCluster) return new Map<string, number>();
    const highlights = new Map<string, number>();
    hoveredCluster.dots.forEach((dot) => {
      highlights.set(dot.seriesId, (dot.x / 100) * TREND_CHART_WIDTH);
    });
    return highlights;
  }, [hoveredCluster]);

  useLayoutEffect(() => {
    if (!clusterStripSyncKey) {
      setClusterStripAnchor((prev) => (prev === null ? prev : null));
      return;
    }

    const [clusterId, dotKey] = clusterStripSyncKey.split("\u0000");
    const clusterSize =
      dotClustersRef.current.find((item) => item.id === clusterId)?.dots.length ?? 0;
    if (clusterSize < 2) {
      setClusterStripAnchor((prev) => (prev === null ? prev : null));
      return;
    }

    const wrap = chartWrapRef.current;
    if (!wrap) {
      setClusterStripAnchor((prev) => (prev === null ? prev : null));
      return;
    }

    const anchor = wrap.querySelector<HTMLButtonElement>(
      `[data-trend-dot-key="${CSS.escape(dotKey)}"]`,
    );
    if (!anchor) {
      setClusterStripAnchor((prev) => (prev === null ? prev : null));
      return;
    }

    const update = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const strip = clusterStripRef.current;
      if (!strip) return;

      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const dotX = clusterAnchor?.dotX ?? 50;
      const bottom = Math.round(window.innerHeight - anchorRect.top + 10);
      const stripWidth = strip.offsetWidth;
      if (stripWidth === 0) {
        requestAnimationFrame(update);
        return;
      }

      const next = {
        left: computeClusterStripLeft(anchorCenterX, stripWidth, dotX),
        bottom,
      };
      setClusterStripAnchor((prev) =>
        prev && prev.left === next.left && prev.bottom === next.bottom ? prev : next,
      );
    };

    update();
    const strip = clusterStripRef.current;
    const resizeObserver =
      strip &&
      new ResizeObserver(() => {
        update();
      });
    if (strip && resizeObserver) resizeObserver.observe(strip);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [clusterStripSyncKey, clusterAnchor]);

  return (
    <div
      className={`trend-plot model-trend-plot${showYAxisLabels ? "" : " trend-plot--no-y-labels"}`}
    >
      <div
        ref={chartWrapRef}
        className="trend-chart-wrap"
        onMouseLeave={() => {
          if (isMobile) return;
          clearTrendHover();
        }}
        onBlur={(event) => {
          if (isMobile) return;
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            clearTrendHover();
          }
        }}
      >
        <svg
          className="trend-chart"
          viewBox={`0 0 ${TREND_CHART_WIDTH} 100`}
          preserveAspectRatio="none"
          role="img"
          aria-label={title}
        >
          {gridRows.map((row) => (
            <polyline
              key={row.label}
              className="trend-grid-line"
              points={`0,${row.y.toFixed(1)} ${TREND_CHART_WIDTH},${row.y.toFixed(1)}`}
            />
          ))}
          <defs>
            {chartRows.map((row) => {
              const highlightX = hoveredLineHighlights.get(row.id);
              if (highlightX === undefined) return null;
              const gradientId = `trend-grad-${sanitizeSvgId(row.id)}`;
              return (
                <linearGradient
                  key={gradientId}
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2={TREND_CHART_WIDTH}
                  y2="0"
                >
                  {buildTrendLineGradientStops(row.color, highlightX).map((stop, index) => (
                    <stop
                      key={`${gradientId}-stop-${index}`}
                      offset={stop.offset}
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              );
            })}
          </defs>
          {chartRows.map((row) => {
            const highlightX = hoveredLineHighlights.get(row.id);
            const gradientId = `trend-grad-${sanitizeSvgId(row.id)}`;
            const isHighlighted = highlightX !== undefined;

            return (
              <path
                key={row.id}
                className={`trend-line model-trend-line${isHighlighted ? " is-highlighted" : ""}`}
                d={row.path}
                style={{
                  stroke: isHighlighted ? `url(#${gradientId})` : row.color,
                }}
              />
            );
          })}
        </svg>
        {chartDots.map((dot) => {
          const row = series.find((item) => item.id === dot.seriesId);
          const isClusterActive = hoveredClusterId === dot.clusterId;

          return (
            <button
              key={trendDotKey(dot)}
              data-trend-dot-key={trendDotKey(dot)}
              className={`trend-html-dot${isClusterActive ? " is-cluster-active" : ""}`}
              type="button"
              aria-label={`${dot.seriesLabel}: ${dot.label}`}
              style={
                {
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  "--dot-color": dot.color,
                } as CSSProperties
              }
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredClusterId(dot.clusterId);
                setHoveredDotKey(trendDotKey(dot));
                setClusterAnchor({ dotX: dot.x });
                setClusterStripAnchor({
                  bottom: Math.round(window.innerHeight - rect.top + 10),
                });
              }}
              onMouseLeave={(event) => {
                if (!shouldClearTrendDotHover(event)) return;
                setHoveredClusterId(null);
                setHoveredDotKey(null);
                setClusterAnchor(null);
                setClusterStripAnchor(null);
              }}
              onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredClusterId(dot.clusterId);
                setHoveredDotKey(trendDotKey(dot));
                setClusterAnchor({ dotX: dot.x });
                setClusterStripAnchor({
                  bottom: Math.round(window.innerHeight - rect.top + 10),
                });
              }}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setHoveredClusterId(null);
                setHoveredDotKey(null);
                setClusterAnchor(null);
                setClusterStripAnchor(null);
              }}
            >
              <span className="trend-html-dot-body" aria-hidden>
                <span className="trend-html-dot-halo" />
                <span
                  className="trend-html-dot-core"
                  style={{ backgroundColor: dot.color }}
                />
              </span>
              {dot.clusterSize === 1 && row ? (
                <span className="trend-tooltip">
                  <TrendTooltipBody
                    label={dot.seriesLabel}
                    growth={getDotGrowthBadge?.(row, dot.value, dot.pointIndex)}
                    periodLabel={dot.periodLabel}
                    primaryLine={getDotPrimaryLine(row, dot.value, dot.pointIndex)}
                    rangeFromStart={getDotRangeFromStartLine?.(row, dot.value, dot.pointIndex)}
                    percentGrowth={getDotPercentGrowthLine?.(row, dot.value, dot.pointIndex)}
                    extraLines={dot.extraLines}
                  />
                </span>
              ) : null}
            </button>
          );
        })}
        {showYAxisLabels
          ? gridRows.map((row) => (
              <span key={row.label} className="trend-y-label" style={{ top: `${row.y}%` }}>
                {row.label}
              </span>
            ))
          : null}
      </div>
      <div className={`trend-labels${compactAxisLabels ? " trend-labels--hourly" : ""}`}>
        {labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            style={{ left: `${getTrendPointXPercent(index, labels.length, pointEdgeInsetPercent)}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      {hoveredCluster &&
        hoveredCluster.dots.length > 1 &&
        clusterAnchor &&
        clusterStripAnchor &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={clusterStripRef}
            className="trend-tooltip-strip trend-tooltip-strip--fixed"
            style={{
              left: `${clusterStripAnchor.left ?? 0}px`,
              bottom: `${clusterStripAnchor.bottom}px`,
              opacity: clusterStripAnchor.left == null ? 0 : 1,
            }}
            aria-hidden
          >
            <div
              className="trend-tooltip-strip-track"
              style={{
                gridTemplateColumns: `repeat(${getClusterStripColumnCount(hoveredCluster.dots.length)}, minmax(170px, 220px))`,
              }}
            >
              {hoveredCluster.dots.map((dot) => {
                const row = series.find((item) => item.id === dot.seriesId);
                if (!row) return null;
                return (
                  <span key={trendDotKey(dot)} className="trend-tooltip trend-tooltip-card">
                    <TrendTooltipBody
                      label={dot.seriesLabel}
                      growth={getDotGrowthBadge?.(row, dot.value, dot.pointIndex)}
                      periodLabel={dot.periodLabel}
                      primaryLine={getDotPrimaryLine(row, dot.value, dot.pointIndex)}
                      rangeFromStart={getDotRangeFromStartLine?.(row, dot.value, dot.pointIndex)}
                      percentGrowth={getDotPercentGrowthLine?.(row, dot.value, dot.pointIndex)}
                      extraLines={dot.extraLines}
                    />
                  </span>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
