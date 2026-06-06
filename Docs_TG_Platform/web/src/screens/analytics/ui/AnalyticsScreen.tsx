"use client";

import { ChannelAnalyticsSection } from "@/widgets/analytics-dashboard";
import AnalyticsHeatmap from "@/screens/analytics/ui/AnalyticsHeatmap";
import AnalyticsScreenHeader from "@/screens/analytics/ui/AnalyticsScreenHeader";
import AnalyticsTopPostsTable from "@/screens/analytics/ui/AnalyticsTopPostsTable";
import { useAnalyticsScreen } from "@/screens/analytics/model/useAnalyticsScreen";

export default function AnalyticsScreen() {
  const { data, ui, actions } = useAnalyticsScreen();

  return (
    <>
      <AnalyticsScreenHeader ui={ui} />
      <div className="analytics-page" id="screen-analytics">
        <div className="analytics-scroll-inner">
          <ChannelAnalyticsSection
            periodIndex={data.period}
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
      </div>
    </>
  );
}
