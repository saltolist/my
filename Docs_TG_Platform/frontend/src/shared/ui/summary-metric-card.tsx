import type { ReactNode } from "react";

import { Card, CardContent } from "@/shared/ui/card";

type SummaryMetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

export function SummaryMetricCard({ label, value, icon }: SummaryMetricCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3 pt-0">
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
