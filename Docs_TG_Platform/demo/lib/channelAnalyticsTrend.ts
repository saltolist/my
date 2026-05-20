import { getPeriodChartLabels } from "@/lib/trendChart/periodLabels";
import { buildTrend, formatNumber, hashString } from "@/lib/trendChart/math";
import type { TrendSeriesRow } from "@/components/charts/MultiSeriesTrendChart";

const CHANNEL_PERIOD_MULTIPLIERS = [0.24, 1, 2.8, 7.4];

const CHANNEL_METRICS = [
  {
    id: "subscribers",
    label: "Подписчики",
    color: "#3d7cff",
    base: 214,
    countForms: ["подписчик", "подписчика", "подписчиков"] as const,
  },
  {
    id: "reactions",
    label: "Реакции",
    color: "#4caf82",
    base: 1286,
    countForms: ["реакция", "реакции", "реакций"] as const,
  },
  {
    id: "views",
    label: "Просмотры",
    color: "#e8954a",
    base: 3820,
    countForms: ["просмотр", "просмотра", "просмотров"] as const,
  },
  {
    id: "comments",
    label: "Комментарии",
    color: "#9b7cdb",
    base: 94,
    countForms: ["комментарий", "комментария", "комментариев"] as const,
  },
  {
    id: "reposts",
    label: "Репосты",
    color: "#e85a5a",
    base: 61,
    countForms: ["репост", "репоста", "репостов"] as const,
  },
  {
    id: "er",
    label: "ER постов",
    color: "#35b8d4",
    base: 48,
    isEr: true,
  },
] as const;

function pluralRu(count: number, forms: readonly [string, string, string]) {
  const n = Math.abs(Math.round(count));
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export const CHANNEL_POST_TABLE_METRICS = CHANNEL_METRICS.map((metric) => ({
  id: metric.id,
  label: metric.id === "er" ? "ER" : metric.label,
}));

const CHANNEL_CURRENT_TOTALS: Record<string, number> = {
  subscribers: 8412,
  reactions: 1286,
  views: 38200,
  comments: 94,
  reposts: 61,
  er: 4.8,
};

export const ANALYTICS_SCREEN_PERIOD_TO_CHART = [1, 2, 3, 4] as const;

function buildPriorCumulative(seed: number, firstIncrement: number, metricId: string) {
  if (firstIncrement <= 0) return 0;

  if (isErMetric(metricId)) {
    const first = firstIncrement / 10;
    const prior = first * (0.9 + (seed % 6) * 0.012);
    return Math.max(1, Math.round(prior * 10));
  }

  return Math.max(1, Math.round(firstIncrement * (0.62 + (seed % 9) * 0.028)));
}

function cumulativeChannelValue(values: number[], pointIndex: number, priorCumulative = 0) {
  const inPeriod = values.slice(0, pointIndex + 1).reduce((sum, item) => sum + item, 0);
  return priorCumulative + inPeriod;
}

function isErMetric(metricId: string) {
  const metric = CHANNEL_METRICS.find((item) => item.id === metricId);
  return metric != null && "isEr" in metric && metric.isEr;
}

/**
 * Индекс в % от состояния до начала графика (prior): первая видимая точка
 * уже отражает прирост за день, поэтому линии не сходятся в одну точку.
 */
function channelPeriodIndexPercent(
  metricId: string,
  values: number[],
  pointIndex: number,
  priorCumulative = 0,
): number {
  if (isErMetric(metricId)) {
    const current = (values[pointIndex] ?? 0) / 10;
    const base =
      priorCumulative > 0 ? priorCumulative / 10 : (values[0] ?? 0) / 10;
    if (base <= 0) return 100;
    return (current / base) * 100;
  }

  const total = cumulativeChannelValue(values, pointIndex, priorCumulative);
  const base =
    priorCumulative > 0 ? priorCumulative : cumulativeChannelValue(values, 0, 0);
  if (base <= 0) return 100;
  return (total / base) * 100;
}

/** Ось Y — индекс от старта периода (совпадает с подписью в карточке). */
export function buildChannelTrendPlotYValues(
  metricId: string,
  values: number[],
  priorCumulative = 0,
): number[] {
  return values.map((_, pointIndex) =>
    channelPeriodIndexPercent(metricId, values, pointIndex, priorCumulative),
  );
}

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
    const priorCumulative = buildPriorCumulative(seed, values[0] ?? 0, metric.id);

    return {
      id: metric.id,
      label: metric.label,
      color: metric.color,
      values,
      priorCumulative,
      yValues: buildChannelTrendPlotYValues(metric.id, values, priorCumulative),
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
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  }
  return `+${formatNumber(Math.round(growth))}`;
}

export type ChannelSummaryCard = {
  id: string;
  label: string;
  value: string;
  displayGrowth: string;
};

export function buildChannelSummaryCards(
  series: TrendSeriesRow[],
  periodIndex: number,
): ChannelSummaryCard[] {
  return buildChannelMetricSummaries(series, periodIndex).map((item) => ({
    id: item.id,
    label: item.label,
    value: formatChannelPostMetricValue(item.id, CHANNEL_CURRENT_TOTALS[item.id] ?? 0),
    displayGrowth: item.displayGrowth,
  }));
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

export function formatChannelPostMetricValue(metricId: string, value: number): string {
  if (isErMetric(metricId)) return `${value.toFixed(1)}%`;
  return formatNumber(Math.round(value));
}

function formatChannelMomentCount(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
  priorCumulative = 0,
): string {
  const metric = CHANNEL_METRICS.find((item) => item.id === metricId);
  if (!metric) return formatNumber(value);

  if ("isEr" in metric && metric.isEr) {
    return `ER ${(value / 10).toFixed(1)}%`;
  }

  const total = cumulativeChannelValue(values, pointIndex, priorCumulative);
  if (!("countForms" in metric)) return formatNumber(total);

  return `${formatNumber(total)} ${pluralRu(total, metric.countForms)}`;
}

export function formatChannelGrowthPercent(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
  priorCumulative = 0,
): string {
  return formatChannelPointGrowthDelta(metricId, value, pointIndex, values, priorCumulative);
}

export function formatChannelGrowthPrimary(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
  priorCumulative = 0,
): string {
  return formatChannelMomentCount(metricId, value, pointIndex, values, priorCumulative);
}

function formatChannelPointGrowthDelta(
  metricId: string,
  value: number,
  pointIndex: number,
  values: number[],
  priorCumulative = 0,
): string {
  if (isErMetric(metricId)) {
    const current = value / 10;
    const previous =
      pointIndex > 0 ? (values[pointIndex - 1] ?? 0) / 10 : priorCumulative / 10;
    const delta = current - previous;
    const sign = delta >= 0 ? "+" : "−";
    return `${sign}${Math.abs(delta).toFixed(1)}%`;
  }

  const total = cumulativeChannelValue(values, pointIndex, priorCumulative);
  const prevTotal =
    pointIndex > 0
      ? cumulativeChannelValue(values, pointIndex - 1, priorCumulative)
      : priorCumulative;
  const delta = Math.round(total - prevTotal);
  const sign = delta >= 0 ? "+" : "−";
  return `${sign}${formatNumber(Math.abs(delta))}`;
}

