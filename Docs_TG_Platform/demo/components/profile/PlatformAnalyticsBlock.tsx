"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/state/AppContext";
import type { AiProfileConfig, LlmModel } from "@/lib/types";

const PERIODS = [
  { label: "24 часа", multiplier: 0.06 },
  { label: "7 дней", multiplier: 0.24 },
  { label: "30 дней", multiplier: 1 },
  { label: "90 дней", multiplier: 2.8 },
  { label: "Всё время", multiplier: 7.4 },
];

const LAST_24_HOURS_POINTS = 24;
const LAST_7_DAYS_POINTS = 7;
const LAST_30_DAYS_POINTS = 30;
const LAST_90_DAYS_POINTS = 30;
const LAST_90_DAYS_STEP = 3;
const PLATFORM_LIFETIME_MONTHS = 6;

function formatAxisDateLabel(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function formatAxisHourLabel(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function formatAxisMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(date);
  return label.endsWith(".") ? label.slice(0, -1) : label;
}

function buildLast24HoursChartLabels(now = new Date()) {
  const end = new Date(now);
  end.setMinutes(0, 0, 0);

  return Array.from({ length: LAST_24_HOURS_POINTS }, (_, index) => {
    const hour = new Date(end);
    hour.setHours(hour.getHours() - (LAST_24_HOURS_POINTS - 1 - index));
    return formatAxisHourLabel(hour);
  });
}

function buildLast7DaysChartLabels(now = new Date()) {
  return Array.from({ length: LAST_7_DAYS_POINTS }, (_, index) => {
    const day = startOfDay(addDays(now, -(LAST_7_DAYS_POINTS - 1 - index)));
    return formatAxisDateLabel(day);
  });
}

function buildLast30DaysChartLabels(now = new Date()) {
  const periodStart = startOfDay(addDays(now, -(LAST_30_DAYS_POINTS - 1)));
  return Array.from({ length: LAST_30_DAYS_POINTS }, (_, index) => {
    const day = addDays(periodStart, index);
    return formatAxisDateLabel(day);
  });
}

function buildLast90DaysChartLabels(now = new Date()) {
  const periodStart = startOfDay(
    addDays(now, -(LAST_90_DAYS_POINTS * LAST_90_DAYS_STEP - 1)),
  );
  return Array.from({ length: LAST_90_DAYS_POINTS }, (_, index) => {
    const day = addDays(periodStart, index * LAST_90_DAYS_STEP);
    return formatAxisDateLabel(day);
  });
}

function buildAllTimeChartLabels(now = new Date()) {
  const currentMonthStart = startOfMonth(now);
  return Array.from({ length: PLATFORM_LIFETIME_MONTHS }, (_, index) => {
    const month = new Date(currentMonthStart);
    month.setMonth(month.getMonth() - (PLATFORM_LIFETIME_MONTHS - 1 - index));
    return formatAxisMonthLabel(month);
  });
}

function getPeriodChartLabels(period: number) {
  if (period === 0) return buildLast24HoursChartLabels();
  if (period === 1) return buildLast7DaysChartLabels();
  if (period === 2) return buildLast30DaysChartLabels();
  if (period === 3) return buildLast90DaysChartLabels();
  if (period === 4) return buildAllTimeChartLabels();
  return [];
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date: Date) {
  const next = new Date(date);
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function formatTrendRangePart(date: Date, withTime: boolean) {
  if (withTime) {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getTrendPointPeriodBounds(
  period: number,
  pointIndex: number,
  pointCount: number,
  now = new Date(),
): { from: Date; to: Date } {
  if (pointCount <= 0) return { from: now, to: now };

  switch (period) {
    case 0: {
      const end = new Date(now);
      end.setMinutes(0, 0, 0);
      const from = new Date(end);
      from.setHours(from.getHours() - (pointCount - 1 - pointIndex));
      if (pointIndex < pointCount - 1) {
        const to = new Date(from);
        to.setHours(to.getHours() + 1);
        return { from, to: to > now ? now : to };
      }
      return { from, to: now };
    }
    case 1: {
      const day = addDays(now, -(pointCount - 1 - pointIndex));
      const from = startOfDay(day);
      const to = pointIndex === pointCount - 1 ? now : endOfDay(day);
      return { from, to };
    }
    case 2: {
      const day = addDays(now, -(pointCount - 1 - pointIndex));
      const from = startOfDay(day);
      const to = pointIndex === pointCount - 1 ? now : endOfDay(day);
      return { from, to };
    }
    case 3: {
      const periodStart = startOfDay(
        addDays(now, -(pointCount * LAST_90_DAYS_STEP - 1)),
      );
      const from = startOfDay(addDays(periodStart, pointIndex * LAST_90_DAYS_STEP));
      if (pointIndex < pointCount - 1) {
        const to = endOfDay(addDays(from, LAST_90_DAYS_STEP - 1));
        return { from, to: to > now ? now : to };
      }
      return { from, to: now };
    }
    case 4: {
      const currentMonthStart = startOfMonth(now);
      const month = new Date(currentMonthStart);
      month.setMonth(month.getMonth() - (pointCount - 1 - pointIndex));
      const from = startOfMonth(month);
      const to = pointIndex === pointCount - 1 ? now : endOfMonth(month);
      return { from, to };
    }
    default:
      return { from: now, to: now };
  }
}

function formatTrendPointPeriod(
  period: number,
  pointIndex: number,
  pointCount: number,
  now = new Date(),
) {
  const { from, to } = getTrendPointPeriodBounds(period, pointIndex, pointCount, now);
  const useTime = period === 0 || from.toDateString() === to.toDateString();
  return `${formatTrendRangePart(from, useTime)} — ${formatTrendRangePart(to, useTime)}`;
}

function getTrendPointXPercent(index: number, pointCount: number) {
  if (pointCount <= 1) return 50;
  return (index / (pointCount - 1)) * 100;
}

const TREND_CLUSTER_STRIP_MARGIN_PX = 12;
const TREND_CLUSTER_STRIP_MAX_COLUMNS = 5;
const TREND_CLUSTER_LEFT_EDGE_PERCENT = 20;
const TREND_CLUSTER_RIGHT_EDGE_PERCENT = 80;

function getClusterStripColumnCount(cardCount: number) {
  return Math.min(Math.max(cardCount, 1), TREND_CLUSTER_STRIP_MAX_COLUMNS);
}

function computeClusterStripLeft(pointerX: number, stripWidth: number, dotXPercent: number) {
  const margin = TREND_CLUSTER_STRIP_MARGIN_PX;
  const minLeft = margin;
  const maxLeft = Math.max(minLeft, window.innerWidth - stripWidth - margin);

  let anchorOffset: number;
  if (dotXPercent >= TREND_CLUSTER_RIGHT_EDGE_PERCENT) {
    anchorOffset = stripWidth;
  } else if (dotXPercent <= TREND_CLUSTER_LEFT_EDGE_PERCENT) {
    anchorOffset = 0;
  } else {
    anchorOffset = stripWidth / 2;
  }

  return Math.round(Math.max(minLeft, Math.min(maxLeft, pointerX - anchorOffset)));
}

type ModelTypeId = "llm" | "web" | "orchestrator" | "webReasoner" | "ragReasoner";
type ModelFilterId = "all" | ModelTypeId;

const MODEL_TYPES: { id: ModelTypeId; label: string; hint: string }[] = [
  { id: "llm", label: "LLM", hint: "генерация ответов и постов" },
  { id: "web", label: "Web Search", hint: "поиск и сбор источников" },
  { id: "orchestrator", label: "Оркестратор", hint: "маршрутизация сценариев" },
  { id: "webReasoner", label: "Web Reasoner", hint: "рассуждения поверх web-источников" },
  { id: "ragReasoner", label: "RAG Reasoner", hint: "рассуждения поверх базы знаний" },
];

const MODEL_FILTERS: { id: ModelFilterId; label: string; hint: string }[] = [
  { id: "all", label: "Все", hint: "сравнение по типам моделей" },
  ...MODEL_TYPES,
];

const MODEL_LINE_COLORS = [
  "#3d7cff",
  "#4caf82",
  "#e8954a",
  "#9b7cdb",
  "#e85a5a",
  "#35b8d4",
  "#d7a935",
  "#7ccf68",
  "#c778dd",
  "#6f9dfb",
];

export default function PlatformAnalyticsBlock() {
  const { state } = useApp();
  const [period, setPeriod] = useState(2);
  const [modelType, setModelType] = useState<ModelFilterId>("all");

  const chartLabels = useMemo(() => getPeriodChartLabels(period), [period]);
  const modelUsage = useMemo(
    () => buildModelUsage(state.aiProfileConfig, PERIODS[period].multiplier, chartLabels.length),
    [state.aiProfileConfig, period, chartLabels.length],
  );
  const selectedTypeMeta = MODEL_FILTERS.find((type) => type.id === modelType) ?? MODEL_FILTERS[0];
  const isAllTypes = modelType === "all";
  const selectedModels = isAllTypes
    ? buildTypeUsage(modelUsage)
    : modelUsage.filter((model) => model.type === modelType);
  const modelTotals = summarizeModelUsage(selectedModels);

  return (
    <>
      <div className="profile-section platform-analytics-section">
        <div className="analytics-card-head">
          <div>
            <div className="profile-section-title">Аналитика моделей</div>
          </div>
          <div className="model-filter-stack">
            <label className="platform-filter-label">
              <select
                className="platform-filter-select"
                value={period}
                onChange={(event) => setPeriod(Number(event.target.value))}
              >
                {PERIODS.map((item, i) => (
                  <option key={item.label} value={i}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="platform-filter-label">
              <select
                className="platform-filter-select"
                value={modelType}
                onChange={(event) => setModelType(event.target.value as ModelFilterId)}
              >
                {MODEL_FILTERS.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="model-analytics-summary">
          <MiniMetric label="Запросы" value={formatNumber(modelTotals.calls)} />
          <MiniMetric label="Токены" value={formatCompact(modelTotals.tokens)} />
          <MiniMetric label="Стоимость" value={`$${modelTotals.cost.toFixed(2)}`} />
        </div>

        <ModelTrendChart
          labels={chartLabels}
          rows={selectedModels}
          period={period}
          compactAxisLabels={period === 0 || period === 2 || period === 3}
          title={`Динамика стоимости: ${selectedTypeMeta.label}`}
        />
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title platform-section-title-spaced">
          {isAllTypes ? "Типы моделей за период" : "Модели за период"}
        </div>
        <div className="model-usage-head">
          <span>{isAllTypes ? "Тип" : "Модель"}</span>
          <span>Запросы</span>
          <span>Токены</span>
          <span>Стоимость</span>
        </div>
        {selectedModels.map((model) => (
          <ModelUsageBar key={model.id} model={model} totals={modelTotals} />
        ))}
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title platform-section-title-spaced">Активность платформы</div>
        <div className="profile-val" style={{ fontSize: 13, color: "var(--text2)" }}>
          Чатов создано: 12 &nbsp;•&nbsp; Заметок: 8 &nbsp;•&nbsp; Постов: 6
        </div>
      </div>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-metric">
      <div className="mini-metric-value">{value}</div>
      <div className="mini-metric-label">{label}</div>
    </div>
  );
}

type ModelUsage = {
  id: string;
  label: string;
  role: string;
  type: ModelTypeId;
  active: boolean;
  calls: number;
  tokens: number;
  cost: number;
  success: number;
  latency: number;
  share: number;
  trend: number[];
  color: string;
};

const TREND_CHART_HEIGHT_PX = 493;
const TREND_DOT_CORE_DIAMETER_PX = 7.5;
const TREND_DOT_CLUSTER_FALLBACK_WIDTH_PX = 720;

type TrendChartDot = {
  modelId: string;
  modelLabel: string;
  color: string;
  x: number;
  y: number;
  value: number;
  label: string;
  pointIndex: number;
  periodLabel: string;
  tokens: number;
  cost: number;
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
      id: `cluster-${index}-${clusterDots.map((dot) => `${dot.modelId}:${dot.label}`).join("|")}`,
      dots: clusterDots,
      x: xs.reduce((sum, value) => sum + value, 0) / clusterDots.length,
      y: ys.reduce((sum, value) => sum + value, 0) / clusterDots.length,
    };
  });
}

function trendDotKey(dot: Pick<TrendChartDot, "modelId" | "label">) {
  return `${dot.modelId}:${dot.label}`;
}

const TREND_CHART_WIDTH = 264;

function sanitizeSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function darkenHex(hex: string, mix = 0.18) {
  const normalized = hex.trim();
  if (!normalized.startsWith("#")) return hex;
  const raw = normalized.slice(1);
  const full =
    raw.length === 3 ? raw.split("").map((channel) => channel + channel).join("") : raw;
  if (full.length !== 6) return hex;

  const channels = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
  const mixChannel = (channel: number) => Math.round(channel * (1 - mix));
  return `rgb(${mixChannel(channels[0])}, ${mixChannel(channels[1])}, ${mixChannel(channels[2])})`;
}

function buildTrendLineGradientStops(baseColor: string, highlightX: number) {
  const darkColor = darkenHex(baseColor);
  const center = Math.max(0, Math.min(1, highlightX / TREND_CHART_WIDTH));
  const offset = (value: number) => `${(value * 100).toFixed(2)}%`;

  if (center <= 0.0001) {
    return [
      { offset: offset(0), color: darkColor },
      { offset: offset(1), color: baseColor },
    ];
  }

  if (center >= 0.9999) {
    return [
      { offset: offset(0), color: baseColor },
      { offset: offset(1), color: darkColor },
    ];
  }

  return [
    { offset: offset(0), color: baseColor },
    { offset: offset(center), color: darkColor },
    { offset: offset(1), color: baseColor },
  ];
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

function getTrendPointCost(model: ModelUsage, index: number) {
  const value = model.trend[index] ?? 0;
  const ratio = model.calls > 0 ? value / model.calls : 0;
  return model.cost * ratio;
}

function collectTrendCosts(rows: ModelUsage[], pointCount: number) {
  return rows.flatMap((model) =>
    Array.from({ length: pointCount }, (_, index) => getTrendPointCost(model, index)),
  );
}

function niceCeil(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const fraction = value / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

function buildAdaptiveCostScale(costs: number[]) {
  const finite = costs.filter((cost) => Number.isFinite(cost) && cost >= 0);
  const dataMax = finite.length > 0 ? Math.max(...finite) : 0;
  const dataMin = finite.length > 0 ? Math.min(...finite) : 0;

  if (dataMax <= 0) {
    return { min: 0, max: 0.01, span: 0.01 };
  }

  const spread = dataMax - dataMin;
  const relativeSpread = dataMax > 0 ? spread / dataMax : 0;

  if (spread > 0 && relativeSpread < 0.12) {
    const pad = Math.max(spread * 0.4, dataMax * 0.08, 0.000_001);
    const min = Math.max(0, dataMin - pad);
    const max = niceCeil(dataMax + pad) || dataMax + pad;
    const span = Math.max(max - min, pad * 2);
    return { min, max: min + span, span };
  }

  const max = niceCeil(dataMax * 1.12) || dataMax * 1.12;
  const span = Math.max(max, dataMax * 1.04);
  return { min: 0, max: span, span };
}

function formatTrendDollar(value: number, scaleMax: number) {
  const absMax = Math.max(scaleMax, Math.abs(value));
  if (absMax < 0.001) return `$${value.toFixed(5)}`;
  if (absMax < 0.01) return `$${value.toFixed(4)}`;
  if (absMax < 0.1) return `$${value.toFixed(3)}`;
  if (absMax < 10) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}

function costToChartY(
  cost: number,
  scale: { min: number; span: number },
  chartBottom: number,
  chartHeight: number,
) {
  if (scale.span <= 0) return chartBottom;
  const normalized = (cost - scale.min) / scale.span;
  return chartBottom - Math.min(1, Math.max(0, normalized)) * chartHeight;
}

function ModelTrendChart({
  labels,
  rows,
  title,
  period,
  compactAxisLabels = false,
}: {
  labels: string[];
  rows: ModelUsage[];
  title: string;
  period: number;
  compactAxisLabels?: boolean;
}) {
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [hoveredDotKey, setHoveredDotKey] = useState<string | null>(null);
  const [clusterStripAnchor, setClusterStripAnchor] = useState<{
    left?: number;
    bottom: number;
  } | null>(null);
  const [clusterPointer, setClusterPointer] = useState<{ x: number; dotX: number } | null>(null);
  const clusterStripRef = useRef<HTMLDivElement>(null);
  const chartTop = 1;
  const chartBottom = 88;
  const chartHeight = chartBottom - chartTop;
  const costScale = buildAdaptiveCostScale(collectTrendCosts(rows, labels.length));
  const midCost = costScale.min + costScale.span / 2;
  const gridRows = [
    { y: chartTop, label: formatTrendDollar(costScale.max, costScale.max) },
    { y: (chartTop + chartBottom) / 2, label: formatTrendDollar(midCost, costScale.max) },
    { y: chartBottom, label: formatTrendDollar(costScale.min, costScale.max) },
  ];
  const chartRows = rows.map((model) => {
    const points = labels.map((_, i) => {
        const cost = getTrendPointCost(model, i);
        const x = labels.length === 1 ? 132 : (264 / (labels.length - 1)) * i;
        const y = costToChartY(cost, costScale, chartBottom, chartHeight);
        return { x, y };
      });
    const dots = labels.map((_, i) => {
      const value = model.trend[i] ?? 0;
      const ratio = model.calls > 0 ? value / model.calls : 0;
      const cost = getTrendPointCost(model, i);
      return {
        x: getTrendPointXPercent(i, labels.length),
        y: costToChartY(cost, costScale, chartBottom, chartHeight),
        value,
        label: labels[i],
        pointIndex: i,
        periodLabel: formatTrendPointPeriod(period, i, labels.length),
        tokens: Math.round(model.tokens * ratio),
        cost,
      };
    });

    return { ...model, path: buildSmoothPath(points), dots };
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
    const flatDots = chartRows.flatMap((model) =>
      model.dots.map((dot, index) => ({
        modelId: model.id,
        modelLabel: model.label,
        color: model.color,
        x: dot.x,
        y: dot.y,
        value: dot.value,
        label: dot.label ?? labels[index],
        pointIndex: dot.pointIndex ?? index,
        periodLabel: dot.periodLabel ?? formatTrendPointPeriod(period, index, labels.length),
        tokens: dot.tokens,
        cost: dot.cost,
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
  const hoveredCluster = useMemo(
    () => dotClusters.find((cluster) => cluster.id === hoveredClusterId) ?? null,
    [dotClusters, hoveredClusterId],
  );
  const clusterStripSyncKey =
    hoveredClusterId && hoveredDotKey && clusterPointer
      ? `${hoveredClusterId}\u0000${hoveredDotKey}\u0000${clusterPointer.x}\u0000${clusterPointer.dotX}\u0000${chartSizePx.width}\u0000${chartSizePx.height}\u0000${hoveredCluster?.dots.length ?? 0}`
      : "";
  const hoveredLineHighlights = useMemo(() => {
    if (!hoveredCluster) return new Map<string, number>();
    const highlights = new Map<string, number>();
    hoveredCluster.dots.forEach((dot) => {
      highlights.set(dot.modelId, (dot.x / 100) * TREND_CHART_WIDTH);
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

      const pointerX = clusterPointer?.x ?? anchorRect.left + anchorRect.width / 2;
      const dotX = clusterPointer?.dotX ?? 50;
      const bottom = Math.round(window.innerHeight - anchorRect.top + 10);
      const stripWidth = strip.offsetWidth;
      if (stripWidth === 0) {
        requestAnimationFrame(update);
        return;
      }

      const next = {
        left: computeClusterStripLeft(pointerX, stripWidth, dotX),
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
    resizeObserver?.observe(strip);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [clusterStripSyncKey, clusterPointer]);

  return (
    <div className="trend-plot model-trend-plot">
      <div
        ref={chartWrapRef}
        className="trend-chart-wrap"
        onMouseLeave={() => {
          setHoveredClusterId(null);
          setHoveredDotKey(null);
          setClusterPointer(null);
          setClusterStripAnchor(null);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHoveredClusterId(null);
            setHoveredDotKey(null);
            setClusterPointer(null);
            setClusterStripAnchor(null);
          }
        }}
      >
        <svg
          className="trend-chart"
          viewBox="0 0 264 100"
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
            {chartRows.map((model) => {
              const highlightX = hoveredLineHighlights.get(model.id);
              if (highlightX === undefined) return null;
              const gradientId = `trend-grad-${sanitizeSvgId(model.id)}`;
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
                  {buildTrendLineGradientStops(model.color, highlightX).map((stop, index) => (
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
          {chartRows.map((model) => {
            const highlightX = hoveredLineHighlights.get(model.id);
            const gradientId = `trend-grad-${sanitizeSvgId(model.id)}`;
            const isHighlighted = highlightX !== undefined;

            return (
              <path
                key={model.id}
                className={`trend-line model-trend-line${isHighlighted ? " is-highlighted" : ""}`}
                d={model.path}
                style={{
                  stroke: isHighlighted ? `url(#${gradientId})` : model.color,
                }}
              />
            );
          })}
        </svg>
        {chartDots.map((dot) => {
          const isClusterActive = hoveredClusterId === dot.clusterId;

          return (
            <button
              key={trendDotKey(dot)}
              data-trend-dot-key={trendDotKey(dot)}
              className={`trend-html-dot${isClusterActive ? " is-cluster-active" : ""}`}
              type="button"
              aria-label={`${dot.modelLabel}: ${formatNumber(dot.value)} запросов, ${dot.label}`}
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
                setClusterPointer({ x: event.clientX, dotX: dot.x });
                setClusterStripAnchor({
                  bottom: Math.round(window.innerHeight - rect.top + 10),
                });
              }}
              onMouseMove={(event) => {
                if (dot.clusterSize < 2) return;
                setClusterPointer({ x: event.clientX, dotX: dot.x });
                setClusterStripAnchor((prev) =>
                  prev ? { bottom: prev.bottom, left: undefined } : prev,
                );
              }}
              onMouseLeave={(event) => {
                if (!shouldClearTrendDotHover(event)) return;
                setHoveredClusterId(null);
                setHoveredDotKey(null);
                setClusterPointer(null);
                setClusterStripAnchor(null);
              }}
              onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredClusterId(dot.clusterId);
                setHoveredDotKey(trendDotKey(dot));
                setClusterPointer({
                  x: rect.left + rect.width / 2,
                  dotX: dot.x,
                });
                setClusterStripAnchor({
                  bottom: Math.round(window.innerHeight - rect.top + 10),
                });
              }}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setHoveredClusterId(null);
                setHoveredDotKey(null);
                setClusterPointer(null);
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
              {dot.clusterSize === 1 ? (
                <span className="trend-tooltip">
                  <b>{dot.modelLabel}</b>
                  <span className="trend-tooltip-period">{dot.periodLabel}</span>
                  <em>{formatNumber(dot.value)} запросов</em>
                  <em>{formatCompact(dot.tokens)} токенов</em>
                  <em>{formatTrendDollar(dot.cost, costScale.max)}</em>
                </span>
              ) : null}
            </button>
          );
        })}
        {gridRows.map((row) => (
          <span
            key={row.label}
            className="trend-y-label"
            style={{ top: `${row.y}%` }}
          >
            {row.label}
          </span>
        ))}
      </div>
      <div
        className={`trend-labels${compactAxisLabels ? " trend-labels--hourly" : ""}`}
      >
        {labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            style={{ left: `${getTrendPointXPercent(index, labels.length)}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      {hoveredCluster &&
        hoveredCluster.dots.length > 1 &&
        clusterPointer &&
        clusterStripAnchor &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={clusterStripRef}
            className="trend-tooltip-strip trend-tooltip-strip--fixed"
            style={{
              left: `${clusterStripAnchor.left ?? clusterPointer.x}px`,
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
              {hoveredCluster.dots.map((dot) => (
                <span key={trendDotKey(dot)} className="trend-tooltip trend-tooltip-card">
                  <b>{dot.modelLabel}</b>
                  <span className="trend-tooltip-period">{dot.periodLabel}</span>
                  <em>{formatNumber(dot.value)} запросов</em>
                  <em>{formatCompact(dot.tokens)} токенов</em>
                  <em>{formatTrendDollar(dot.cost, costScale.max)}</em>
                </span>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ModelUsageBar({ model, totals }: { model: ModelUsage; totals: ReturnType<typeof summarizeModelUsage> }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const callsShare = totals.calls > 0 ? Math.round((model.calls / totals.calls) * 100) : 0;
  const tokensShare = totals.tokens > 0 ? Math.round((model.tokens / totals.tokens) * 100) : 0;
  const costShare = totals.cost > 0 ? Math.round((model.cost / totals.cost) * 100) : 0;

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    const tooltipWidth = 190;
    const x = Math.min(clientX + 14, window.innerWidth - tooltipWidth - 8);
    const y = Math.max(clientY - 12, 8);
    setTooltipPos({ x, y });
  };

  return (
    <div className="bar-row model-usage-bar">
      <div className="bar-label">
        <span>{model.label}</span>
      </div>
      <div
        className="bar-track model-usage-track"
        tabIndex={0}
        style={{ "--fill-width": `${Math.max(model.share, 4)}%` } as CSSProperties}
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
          className={`bar-fill ${model.type}`}
          style={{ "--bar-color": model.color, backgroundColor: model.color } as CSSProperties}
        />
      </div>
      {tooltipPos ? (
        <div
          className="model-usage-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <b>{model.label}</b>
          <span>Запросы: {callsShare}%</span>
          <span>Токены: {tokensShare}%</span>
          <span>Стоимость: {costShare}%</span>
        </div>
      ) : null}
      <div className="model-row-metric">{formatNumber(model.calls)}</div>
      <div className="model-row-metric">{formatCompact(model.tokens)}</div>
      <div className="model-row-metric">${model.cost.toFixed(2)}</div>
    </div>
  );
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  return points.slice(1).reduce((path, point, i) => {
    const prev = points[i];
    const controlOffset = (point.x - prev.x) * 0.45;
    const c1x = prev.x + controlOffset;
    const c2x = point.x - controlOffset;

    return `${path} C ${c1x.toFixed(1)} ${prev.y.toFixed(1)}, ${c2x.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`);
}

function buildModelUsage(
  config: AiProfileConfig,
  periodMultiplier: number,
  trendPointCount = 7,
): ModelUsage[] {
  const models = [
    ...mapConfigModels(config.llmModels, "llm", "LLM"),
    ...mapConfigModels(config.webSearchModels, "web", "Web Search"),
    ...mapConfigModels(config.orchestratorModels, "orchestrator", "Оркестратор"),
    ...mapConfigModels(config.webReasonerModels, "webReasoner", "Web Reasoner"),
    ...mapConfigModels(config.ragReasonerModels, "ragReasoner", "RAG Reasoner"),
  ];

  const usage = models.map((model) => {
    const seed = hashString(`${model.id}:${model.label}:${model.role}`);
    const baseCalls = 130 + (seed % 760);
    const activityBoost = model.active ? 1 : 0.36;
    const calls = Math.round(baseCalls * periodMultiplier * activityBoost);
    const tokensPerCall = 640 + (seed % 1900);
    const trend = buildTrend(seed, calls, trendPointCount);

    return {
      ...model,
      calls,
      tokens: Math.round(calls * tokensPerCall),
      cost: calls * tokensPerCall * (0.0000018 + (seed % 7) * 0.00000022),
      success: 91 + (seed % 8),
      latency: 620 + (seed % 740),
      share: 0,
      trend,
      color: "",
    };
  });

  const totalsByType = usage.reduce<Record<ModelTypeId, number>>(
    (acc, model) => ({ ...acc, [model.type]: acc[model.type] + model.calls }),
    { llm: 0, web: 0, orchestrator: 0, webReasoner: 0, ragReasoner: 0 },
  );

  return usage
    .map((model) => ({
      ...model,
      share: totalsByType[model.type] > 0 ? Math.round((model.calls / totalsByType[model.type]) * 100) : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .map((model, i) => ({
      ...model,
      color: MODEL_LINE_COLORS[i % MODEL_LINE_COLORS.length],
    }));
}

function mapConfigModels(models: LlmModel[], type: ModelTypeId, role: string) {
  return models
    .filter((model) => model.provider && model.model)
    .map((model) => ({
      id: `${type}-${role}-${model.id}`,
      label: `${model.provider} / ${model.model}`,
      role,
      type,
      active: model.active,
    }));
}

function buildTypeUsage(models: ModelUsage[]): ModelUsage[] {
  const totalCalls = models.reduce((sum, model) => sum + model.calls, 0);

  return MODEL_TYPES.map((type, i) => {
    const rows = models.filter((model) => model.type === type.id);
    if (rows.length === 0) return null;

    const calls = rows.reduce((sum, model) => sum + model.calls, 0);
    const tokens = rows.reduce((sum, model) => sum + model.tokens, 0);
    const cost = rows.reduce((sum, model) => sum + model.cost, 0);
    const latency =
      calls > 0
        ? Math.round(rows.reduce((sum, model) => sum + model.latency * model.calls, 0) / calls)
        : 0;
    const success =
      calls > 0
        ? Math.round(rows.reduce((sum, model) => sum + model.success * model.calls, 0) / calls)
        : 0;
    const trendLength = Math.max(...rows.map((model) => model.trend.length), 0);
    const trend = Array.from({ length: trendLength }, (_, trendIndex) =>
      rows.reduce((sum, model) => sum + (model.trend[trendIndex] ?? 0), 0),
    );

    return {
      id: `type-${type.id}`,
      label: type.label,
      role: "Тип моделей",
      type: type.id,
      active: rows.some((model) => model.active),
      calls,
      tokens,
      cost,
      success,
      latency,
      share: totalCalls > 0 ? Math.round((calls / totalCalls) * 100) : 0,
      trend,
      color: MODEL_LINE_COLORS[i % MODEL_LINE_COLORS.length],
    };
  }).filter((model): model is ModelUsage => model !== null);
}

function buildTrend(seed: number, total: number, pointCount = 7) {
  const weights = Array.from({ length: pointCount }, (_, i) => {
    const progress = pointCount === 1 ? 0 : i / (pointCount - 1);
    const weight = 0.72 + progress * 0.56;
    return weight + ((seed >> (i % 8)) % 5) * 0.035;
  });
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => Math.max(1, Math.round((total * weight) / weightTotal)));
}

function summarizeModelUsage(models: ModelUsage[]) {
  const calls = models.reduce((sum, model) => sum + model.calls, 0);
  const tokens = models.reduce((sum, model) => sum + model.tokens, 0);
  const cost = models.reduce((sum, model) => sum + model.cost, 0);
  const success =
    calls > 0
      ? Math.round(models.reduce((sum, model) => sum + model.success * model.calls, 0) / calls)
      : 0;

  return { calls, tokens, cost, success };
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => {
    const nextHash = (hash << 5) - hash + char.charCodeAt(0);
    return nextHash >>> 0;
  }, 2166136261);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
