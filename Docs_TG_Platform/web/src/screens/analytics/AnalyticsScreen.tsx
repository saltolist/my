"use client";

import { ChannelAnalyticsSection } from "@/widgets/analytics-dashboard";
import { useAnalyticsScreen } from "@/screens/analytics/model/useAnalyticsScreen";
import AnalyticsHeatmap from "@/screens/analytics/ui/AnalyticsHeatmap";
import AnalyticsTopPostsTable from "@/screens/analytics/ui/AnalyticsTopPostsTable";
import { useScreenBack } from "@/widgets/app-shell/model/useScreenBack";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader, PageHeaderSelect } from "@/widgets/page-header";

export function AnalyticsScreen() {
  const onBack = useScreenBack();
  const { data, ui, actions } = useAnalyticsScreen();

  return (
    <ScreenShell
      bodyClassName="analytics-page"
      header={
        <PageHeader
          title="Аналитика канала"
          onBack={onBack}
          mobileSelect={ui.isMobile ? <PageHeaderSelect {...ui.periodSelectProps} /> : undefined}
        />
      }
    >
      <div className="analytics-scroll-inner">
        <ChannelAnalyticsSection
          periodIndex={data.periodIndex}
          periods={data.periods}
          onPeriodChange={actions.setPeriod}
        />
        <AnalyticsHeatmap />
        <AnalyticsTopPostsTable
          isMobile={ui.isMobile}
          posts={data.rankedTopPosts}
          metrics={data.topPostsTableMetrics}
          wrapStyle={data.topPostsTableWrapStyle}
          gridStyle={data.topPostsDesktopGridStyle}
          onOpenPost={actions.openPost}
        />
      </div>
    </ScreenShell>
  );
}
