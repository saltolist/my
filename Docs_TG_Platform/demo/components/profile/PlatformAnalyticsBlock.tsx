"use client";

import PlatformActivitySection from "@/components/profile/analytics/PlatformActivitySection";
import PlatformModelUsageSection from "@/components/profile/analytics/PlatformModelUsageSection";
import PlatformModelsChartSection from "@/components/profile/analytics/PlatformModelsChartSection";
import { usePlatformAnalyticsBlock } from "@/lib/hooks/usePlatformAnalyticsBlock";

type Props = {
  period: number;
  onPeriodChange: (next: number) => void;
  periodInHeader?: boolean;
};

export default function PlatformAnalyticsBlock({
  period,
  onPeriodChange,
  periodInHeader = false,
}: Props) {
  const analytics = usePlatformAnalyticsBlock({ period, onPeriodChange, periodInHeader });

  return (
    <>
      <PlatformModelsChartSection
        period={analytics.period}
        onPeriodChange={analytics.onPeriodChange}
        periodInHeader={analytics.periodInHeader}
        modelType={analytics.modelType}
        onModelTypeChange={analytics.setModelType}
        modelTotals={analytics.modelTotals}
        chartLabels={analytics.chartLabels}
        chartTitle={analytics.chartTitle}
        selectedModels={analytics.selectedModels}
        visibleCostTrendSeries={analytics.visibleCostTrendSeries}
        selectorItems={analytics.selectorItems}
        isVisible={analytics.isVisible}
        onVisibleChange={analytics.setVisible}
        compactAxisLabels={analytics.compactAxisLabels}
      />
      <PlatformModelUsageSection
        isAllTypes={analytics.isAllTypes}
        selectedModels={analytics.selectedModels}
        modelTotals={analytics.modelTotals}
      />
      <PlatformActivitySection />
    </>
  );
}
