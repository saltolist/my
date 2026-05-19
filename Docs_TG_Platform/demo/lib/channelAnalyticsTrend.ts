import { getPeriodChartLabels } from "@/lib/trendChart/periodLabels";
import { buildTrend, formatCompact, formatNumber, hashString } from "@/lib/trendChart/math";
import type { TrendSeriesRow } from "@/components/charts/MultiSeriesTrendChart";

const CHANNEL_PERIOD_MULTIPLIERS = [0.24, 1, 2.8, 7.4];

const CHANNEL_METRICS = [
  { id: "subscribers", label: "Подписчики", color: "#3d7cff", base: 214, growthLabel: "подписчиков" },
  { id: "reactions", label: "Реакции", color: "#4caf82", base: 1286, growthLabel: "реакций" },
  { id: "views", label: "Просмотры", color: "#e8954a", base: 3820, growthLabel: "просмотров" },
  { id: "comments", label: "Комментарии", color: "#9b7cdb", base: 94, growthLabel: "комментариев" },
  { id: "reposts", label: "Репосты", color: "#e85a5a", base: 61, growthLabel: "репостов" },
  {
    id: "er",
    label: "ER постов",
    color: "#35b8d4",
    base: 48,
    growthLabel: "ER",
    isEr: true,
  },
] as const;

const CHANNEL_CURRENT_TOTALS: Record<string, number> = {
  subscribers: 8412,
  reactions: 1286,
  views: 38200,
  comments: 94,
  reposts: 61,
  er: 4.8,
};

export const ANALYTICS_SCREEN_PERIOD_TO_CHART = [1, 2, 3, 4] as const;

export function buildChannelTrendSeries(analyticsPeriodIndex: number): {
  labels: string[];
  series: TrendSeriesRow[];
} {
  const chartPeriod = ANALYTICS_SCREEN_PERIOD_TO_CHART[analyticsPeriodIndex] ?? 1;
  const labels = getPeriodChartLabels(chartPeriod);
  const multiplier = CHANNEL_PERIOD_MULTIPLIERS[analyticsPeriodIndex] ?? 1;
  const pointCount = labels.length;

  const series: TrendSeriesRow[] = CHANNEL_METRICS.map((metric) => {
    const seed = hashString(`channel:${metric.id}:${chartPeriod}`);
    const total = Math.max(1, Math.round(metric.base * multiplier));
    const values = buildTrend(seed, total, pointCount);

    return {
      id: metric.id,
      label: metric.label,
      color: metric.color,
      values,
    };
  });

  return { labels, series };
}

export type ChannelMetricSummary = {
  id: string;
  label: string;
  color: string;
  share: number;
  displayGrowth: string;
  growthShare: number;
};

function isErMetric(metricId: string) {
  const metric = CHANNEL_METRICS.find((item) => item.id === metricId);
  return metric != null && "isEr" in metric && metric.isEr;
}

function computePeriodGrowth(metricId: string, values: number[]): number {
  if (isErMetric(metricId)) {
    const last = values[values.length - 1] ?? 0;
    const first = values[0] ?? last;
    return Math.max(0, (last - first) / 10);
  }
  return values.reduce((sum, value) => sum + value, 0);
}

function formatGrowthDelta(metricId: string, growth: number) {
  if (isErMetric(metricId)) {
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)} п.п.`;
  }
  return `+${formatNumber(Math.round(growth))}`;
}

export function buildChannelMetricSummaries(
  series: TrendSeriesRow[],
  periodIndex: number,
): ChannelMetricSummary[] {
  const rows = series.map((row) => {
    const total = CHANNEL_CURRENT_TOTALS[row.id] ?? 0;
    let growth = computePeriodGrowth(row.id, row.values);

    if (!isErMetric(row.id)) {
      const maxGrowth = total * (0.12 + periodIndex * 0.08);
      if (growth > maxGrowth) {
        growth = Math.round(maxGrowth);
      }
    } else {
      growth = Math.min(growth, Math.max(0, total - 0.5));
    }

    return { row, growth };
  });

  const maxGrowth = Math.max(...rows.map((item) => item.growth), 1);
  const totalGrowth = rows.reduce((sum, item) => sum + item.growth, 0);

  return rows.map(({ row, growth }) => ({
    id: row.id,
    label: row.label,
    color: row.color,
    share: Math.max(4, Math.round((growth / maxGrowth) * 100)),
    growthShare: totalGrowth > 0 ? Math.round((growth / totalGrowth) * 100) : 0,
    displayGrowth: formatGrowthDelta(row.id, growth),
  }));
}

export function formatChannelGrowthPrimary(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
): string {
  const metric = CHANNEL_METRICS.find((item) => item.id === metricId);
  if (!metric) return formatNumber(value);

  if ("isEr" in metric && metric.isEr) {
    const er = (value / 10).toFixed(1);
    return `ER ${er}%`;
  }

  return `+${formatNumber(value)} ${metric.growthLabel}`;
}

export function formatChannelGrowthExtra(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
): string[] {
  const prev = pointIndex > 0 ? (values[pointIndex - 1] ?? 0) : value;
  const delta = prev > 0 ? Math.round(((value - prev) / prev) * 100) : 0;
  const deltaLabel = delta >= 0 ? `+${delta}%` : `${delta}%`;
  const totalLabel =
    metricId === "er"
      ? `к прошлой точке: ${delta >= 0 ? "+" : ""}${(value / 10 - prev / 10).toFixed(1)} п.п.`
      : `к прошлой точке: ${deltaLabel}`;

  if (value >= 10_000) {
    return [totalLabel, `всего за точку: ${formatCompact(value)}`];
  }

  return [totalLabel];
}
