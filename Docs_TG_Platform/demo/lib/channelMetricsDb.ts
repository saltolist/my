import channelMetricsData from "@/data/channelMetrics110d.json";

export type ChannelMetricId =
  | "subscribers"
  | "reactions"
  | "views"
  | "comments"
  | "reposts"
  | "er";

export type ChannelDayRecord = Record<ChannelMetricId, number>;

export type ChannelMetricsDatabase = {
  version: number;
  dayCount: number;
  startTotals: ChannelDayRecord;
  endTotals: ChannelDayRecord;
  days: ChannelDayRecord[];
};

const db = channelMetricsData as ChannelMetricsDatabase;

export const CHANNEL_METRICS_DB = db;

export function getChannelEndTotals(): ChannelDayRecord {
  return { ...db.endTotals };
}

export function isChannelErMetric(metricId: string) {
  return metricId === "er";
}

export function getChannelChartPeriodDaySpan(chartPeriod: number) {
  return chartPeriodToDaySpan(chartPeriod);
}

function chartPeriodToDaySpan(chartPeriod: number) {
  switch (chartPeriod) {
    case 0:
      return 1;
    case 1:
      return 7;
    case 2:
      return 30;
    case 3:
      return 90;
    case 4:
      return db.dayCount;
    default:
      return 7;
  }
}

function cumulativeCountMetric(metricId: ChannelMetricId, throughDayIndex: number) {
  let total = db.startTotals[metricId] ?? 0;
  for (let i = 0; i <= throughDayIndex && i < db.days.length; i++) {
    total += db.days[i]?.[metricId] ?? 0;
  }
  return total;
}

function priorCumulativeForMetric(metricId: ChannelMetricId, dayIndexBeforeWindow: number) {
  if (isChannelErMetric(metricId)) {
    if (dayIndexBeforeWindow < 0) {
      return Math.round((db.startTotals.er ?? 0) * 10);
    }
    return Math.round((db.days[dayIndexBeforeWindow]?.er ?? db.startTotals.er) * 10);
  }
  return cumulativeCountMetric(metricId, dayIndexBeforeWindow);
}

function hashHour(seed: number) {
  let t = (seed * 2654435761) >>> 0;
  t ^= t >>> 16;
  return (t & 0xffff) / 0xffff;
}

/** Делит дневную дельту на почасовые (сумма = delta, значения разные). */
function splitDayDeltaIntoHours(delta: number, hours: number, seed: number) {
  if (hours <= 1) return [delta];
  const weights = Array.from({ length: hours }, (_, hour) => 0.25 + hashHour(seed + hour) * 1.5);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const scaled = weights.map((weight) => (weight / weightSum) * delta);
  const rounded = scaled.map((value) => Math.round(value));
  const drift = delta - rounded.reduce((sum, value) => sum + value, 0);
  rounded[rounded.length - 1] += drift;
  return rounded;
}

function bucketSum(values: number[], bucketCount: number) {
  if (bucketCount <= 0) return [];
  if (bucketCount >= values.length) return [...values];
  const buckets: number[] = [];
  for (let bucket = 0; bucket < bucketCount; bucket++) {
    const start = Math.floor((bucket / bucketCount) * values.length);
    const end = Math.floor(((bucket + 1) / bucketCount) * values.length);
    let sum = 0;
    for (let i = start; i < end; i++) sum += values[i] ?? 0;
    buckets.push(sum);
  }
  return buckets;
}

function bucketLast(values: number[], bucketCount: number) {
  if (bucketCount <= 0) return [];
  if (bucketCount >= values.length) return [...values];
  const buckets: number[] = [];
  for (let bucket = 0; bucket < bucketCount; bucket++) {
    const end = Math.floor(((bucket + 1) / bucketCount) * values.length) - 1;
    const index = Math.max(0, Math.min(values.length - 1, end));
    buckets.push(values[index] ?? 0);
  }
  return buckets;
}

export function extractChannelMetricSeriesForChart(
  metricId: ChannelMetricId,
  chartPeriod: number,
  pointCount: number,
): { values: number[]; priorCumulative: number } {
  const daySpan = Math.min(chartPeriodToDaySpan(chartPeriod), db.days.length);
  const sliceStart = Math.max(0, db.days.length - daySpan);
  const windowDays = db.days.slice(sliceStart);
  const priorDayIndex = sliceStart - 1;
  const priorCumulative = priorCumulativeForMetric(metricId, priorDayIndex);

  if (chartPeriod === 0 && pointCount > 1) {
    const lastDay = windowDays[windowDays.length - 1] ?? db.days[db.days.length - 1];
    if (isChannelErMetric(metricId)) {
      const level = Math.round((lastDay?.er ?? db.endTotals.er) * 10);
      return { values: Array.from({ length: pointCount }, () => level), priorCumulative };
    }
    const seed = sliceStart * 17 + metricId.length;
    return {
      values: splitDayDeltaIntoHours(lastDay?.[metricId] ?? 0, pointCount, seed),
      priorCumulative,
    };
  }

  const raw = windowDays.map((day) =>
    isChannelErMetric(metricId) ? Math.round(day.er * 10) : day[metricId],
  );

  const values = isChannelErMetric(metricId)
    ? bucketLast(raw, pointCount)
    : bucketSum(raw, pointCount);

  return { values, priorCumulative };
}

/** Средний суточный прирост по всей истории (110 дней). */
export function getMetricHistoricalAverageDailyDelta(metricId: ChannelMetricId) {
  if (isChannelErMetric(metricId)) {
    let sum = 0;
    let prev = db.startTotals.er;
    for (const day of db.days) {
      sum += day.er - prev;
      prev = day.er;
    }
    return sum / db.days.length;
  }
  const sum = db.days.reduce((acc, day) => acc + (day[metricId] ?? 0), 0);
  return sum / db.days.length;
}

/** Типичный прирост метрики за окно периода: ср. в день × число дней. */
export function getMetricTypicalPeriodGrowth(
  metricId: ChannelMetricId,
  daySpan: number,
) {
  const span = Math.max(1, Math.min(daySpan, db.dayCount));
  return getMetricHistoricalAverageDailyDelta(metricId) * span;
}
