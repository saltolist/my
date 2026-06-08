"use client";

import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";

type ChartPoint = {
  label: string;
  value: number;
};

type SimpleLineChartProps = {
  data: ChartPoint[];
  height?: number;
  className?: string;
  ariaLabel?: string;
};

export function SimpleLineChart({
  data,
  height = 180,
  className,
  ariaLabel = "График просмотров",
}: SimpleLineChartProps) {
  const width = 640;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };

  const { path, areaPath, yTicks, xLabels, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", areaPath: "", yTicks: [] as number[], xLabels: [] as ChartPoint[], maxValue: 0 };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const coords = data.map((point, index) => {
      const x =
        padding.left +
        (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = padding.top + (1 - point.value / max) * chartHeight;
      return { x, y };
    });

    const linePath = coords
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const first = coords[0];
    const last = coords[coords.length - 1];
    const area =
      first && last
        ? `${linePath} L ${last.x} ${padding.top + chartHeight} L ${first.x} ${padding.top + chartHeight} Z`
        : "";

    const ticks = [0, 0.5, 1].map((ratio) => Math.round(max * ratio));
    const labelStep = Math.max(1, Math.floor(data.length / 6));
    const labels = data.filter((_, index) => index % labelStep === 0 || index === data.length - 1);

    return {
      path: linePath,
      areaPath: area,
      yTicks: ticks,
      xLabels: labels,
      maxValue: max,
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
    );
  }

  const chartHeight = height - padding.top - padding.bottom;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full max-w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      {yTicks.map((tick) => {
        const y = padding.top + (1 - tick / maxValue) * chartHeight;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {tick >= 1000 ? `${Math.round(tick / 100) / 10}k` : tick}
            </text>
          </g>
        );
      })}

      {areaPath ? (
        <path d={areaPath} fill="var(--color-chart-1)" fillOpacity={0.18} />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke="var(--color-chart-2)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {xLabels.map((point) => {
        const index = data.findIndex((d) => d.label === point.label && d.value === point.value);
        const x =
          padding.left +
          (index / Math.max(data.length - 1, 1)) * (width - padding.left - padding.right);
        return (
          <text
            key={`${point.label}-${index}`}
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {point.label}
          </text>
        );
      })}
    </svg>
  );
}
