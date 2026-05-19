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

function buildLast24HoursChartLabels(now = getChartReferenceNow(0)) {
  const end = new Date(now);
  end.setMinutes(0, 0, 0);

  return Array.from({ length: LAST_24_HOURS_POINTS }, (_, index) => {
    const hour = new Date(end);
    hour.setHours(hour.getHours() - (LAST_24_HOURS_POINTS - 1 - index));
    return formatAxisHourLabel(hour);
  });
}

function buildLast7DaysChartLabels(now = getChartReferenceNow(1)) {
  return Array.from({ length: LAST_7_DAYS_POINTS }, (_, index) => {
    const day = startOfDay(addDays(now, -(LAST_7_DAYS_POINTS - 1 - index)));
    return formatAxisDateLabel(day);
  });
}

function buildLast30DaysChartLabels(now = getChartReferenceNow(2)) {
  const periodStart = startOfDay(addDays(now, -(LAST_30_DAYS_POINTS - 1)));
  return Array.from({ length: LAST_30_DAYS_POINTS }, (_, index) => {
    const day = addDays(periodStart, index);
    return formatAxisDateLabel(day);
  });
}

function buildLast90DaysChartLabels(now = getChartReferenceNow(3)) {
  const periodStart = startOfDay(addDays(now, -(LAST_90_DAYS_POINTS * LAST_90_DAYS_STEP - 1)));
  return Array.from({ length: LAST_90_DAYS_POINTS }, (_, index) => {
    const day = addDays(periodStart, index * LAST_90_DAYS_STEP);
    return formatAxisDateLabel(day);
  });
}

function buildAllTimeChartLabels(now = getChartReferenceNow(4)) {
  const currentMonthStart = startOfMonth(now);
  return Array.from({ length: PLATFORM_LIFETIME_MONTHS }, (_, index) => {
    const month = new Date(currentMonthStart);
    month.setMonth(month.getMonth() - (PLATFORM_LIFETIME_MONTHS - 1 - index));
    return formatAxisMonthLabel(month);
  });
}

export function getPeriodChartLabels(period: number) {
  if (period === 0) return buildLast24HoursChartLabels();
  if (period === 1) return buildLast7DaysChartLabels();
  if (period === 2) return buildLast30DaysChartLabels();
  if (period === 3) return buildLast90DaysChartLabels();
  if (period === 4) return buildAllTimeChartLabels();
  return [];
}

/** Stable anchor for SSR/hydration and chart bounds (no live clock in tooltips). */
function getChartReferenceNow(period: number) {
  const now = new Date();
  if (period === 0) {
    now.setMinutes(0, 0, 0);
    return now;
  }
  return startOfDay(now);
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
  now = getChartReferenceNow(period),
): { from: Date; to: Date } {
  if (pointCount <= 0) return { from: now, to: now };

  switch (period) {
    case 0: {
      const end = new Date(now);
      const from = new Date(end);
      from.setHours(from.getHours() - (pointCount - 1 - pointIndex));
      const to = new Date(from);
      to.setHours(to.getHours() + 1);
      return { from, to };
    }
    case 1: {
      const day = addDays(now, -(pointCount - 1 - pointIndex));
      const from = startOfDay(day);
      return { from, to: endOfDay(day) };
    }
    case 2: {
      const day = addDays(now, -(pointCount - 1 - pointIndex));
      const from = startOfDay(day);
      return { from, to: endOfDay(day) };
    }
    case 3: {
      const periodStart = startOfDay(addDays(now, -(pointCount * LAST_90_DAYS_STEP - 1)));
      const from = startOfDay(addDays(periodStart, pointIndex * LAST_90_DAYS_STEP));
      const to = endOfDay(addDays(from, LAST_90_DAYS_STEP - 1));
      return { from, to };
    }
    case 4: {
      const currentMonthStart = startOfMonth(now);
      const month = new Date(currentMonthStart);
      month.setMonth(month.getMonth() - (pointCount - 1 - pointIndex));
      const from = startOfMonth(month);
      return { from, to: endOfMonth(month) };
    }
    default:
      return { from: now, to: now };
  }
}

export function formatTrendPointPeriod(
  period: number,
  pointIndex: number,
  pointCount: number,
  now = getChartReferenceNow(period),
) {
  const { from, to } = getTrendPointPeriodBounds(period, pointIndex, pointCount, now);
  const useTime = period === 0 || from.toDateString() === to.toDateString();
  return `${formatTrendRangePart(from, useTime)} — ${formatTrendRangePart(to, useTime)}`;
}

export function getTrendPointXPercent(index: number, pointCount: number) {
  if (pointCount <= 1) return 50;
  return (index / (pointCount - 1)) * 100;
}
