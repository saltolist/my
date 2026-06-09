"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import { useTopLevelBack } from "@/shared/lib/hooks/useTopLevelBack";
import type { AnalyticsPeriod } from "@/shared/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { AnalyticsPeriodFilter } from "@/widgets/analytics/ui/analytics-period-filter";
import { PageHeader } from "@/widgets/page-header";

export function AnalyticsScreen() {
  const onBack = useTopLevelBack();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Аналитика"
          center={<AnalyticsPeriodFilter value={period} onChange={setPeriod} />}
          onBack={onBack}
        />
      }
    >
      <EmptyState
        icon={<BarChart3 className="size-5" />}
        message={`Дашборд аналитики (период: ${period}) появится на следующем шаге.`}
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
