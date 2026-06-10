"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

import { useNavigationStore } from "@/app/model/store";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import type { AnalyticsPeriod } from "@/shared/data/analytics-seed";
import { ANALYTICS_PERIOD_OPTIONS } from "@/shared/data/analytics-seed";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { AnalyticsPeriodFilter } from "@/widgets/analytics/ui/analytics-period-filter";
import { PageHeader, PageHeaderSelect } from "@/widgets/page-header";

export function AnalyticsScreen() {
  const isMobile = useMobile760();
  const onBack = useScreenBack();
  const period = useNavigationStore((s) => s.analyticsPeriod);
  const setAnalyticsPeriod = useNavigationStore((s) => s.setAnalyticsPeriod);

  const periodSelectProps = useMemo(
    () => ({
      ariaLabel: "Период аналитики",
      value: period,
      options: ANALYTICS_PERIOD_OPTIONS,
      onChange: (v: string) => setAnalyticsPeriod(v as AnalyticsPeriod),
    }),
    [period, setAnalyticsPeriod],
  );

  return (
    <ScreenShell
      header={
        <PageHeader
          title="Аналитика канала"
          onBack={onBack}
          center={
            !isMobile ? (
              <AnalyticsPeriodFilter value={period} onChange={setAnalyticsPeriod} />
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
