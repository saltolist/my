"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export type RubricBreakdownRow = {
  title: string;
  count: number;
  share: number;
};

type RubricBreakdownProps = {
  rows: RubricBreakdownRow[];
};

export function RubricBreakdown({ rows }: RubricBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Рубрики</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.title} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{row.title}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {row.count} · {row.share}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${row.share}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
