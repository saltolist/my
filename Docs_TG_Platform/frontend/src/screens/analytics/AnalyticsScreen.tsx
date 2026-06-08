"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/shared/config/routes";
import type { AnalyticsPeriod } from "@/shared/data/analytics-seed";
import { AnalyticsDashboard, AnalyticsPeriodFilter } from "@/widgets/analytics-dashboard";
import { PageHeader } from "@/widgets/page-header";

export function AnalyticsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  const openPost = useCallback(
    (postId: number) => {
      router.push(routes.post(postId));
    },
    [router],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Аналитика"
        center={<AnalyticsPeriodFilter value={period} onChange={setPeriod} />}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <AnalyticsDashboard period={period} onPostClick={openPost} />
      </div>
    </div>
  );
}
