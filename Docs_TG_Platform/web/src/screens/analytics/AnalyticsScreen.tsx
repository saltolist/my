"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";

import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import type { AnalyticsPeriod } from "@/shared/data/analytics-seed";
import { ANALYTICS_PERIOD_OPTIONS } from "@/shared/data/analytics-seed";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { AnalyticsPeriodFilter } from "@/widgets/analytics/ui/analytics-period-filter";
import { PageHeader, PageHeaderSelect } from "@/widgets/page-header";

export function AnalyticsScreen() {
  const isMobile = useMobile760();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  const periodSelectProps = useMemo(
    () => ({
      ariaLabel: "Период аналитики",
      value: period,
      options: ANALYTICS_PERIOD_OPTIONS,
      onChange: (v: string) => setPeriod(v as AnalyticsPeriod),
    }),
    [period],
  );

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Аналитика канала"
          backTo="home"
          center={
            !isMobile ? (
              <AnalyticsPeriodFilter value={period} onChange={setPeriod} />
            ) : undefined
          }
          mobileSelect={isMobile ? <PageHeaderSelect {...periodSelectProps} /> : undefined}
        />
      }
    >
      <div className="analytics-page">
        <div className="analytics-scroll-inner">
          <EmptyState
            icon={<BarChart3 className="size-5" />}
            message={`Дашборд аналитики (период: ${period}) появится на следующем шаге.`}
            className="min-h-[50vh]"
          />
        </div>
      </div>
    </ScreenShell>
  );
}
