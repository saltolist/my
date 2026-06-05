"use client";

import { ChannelAnalyticsSection } from "@/widgets/analytics-dashboard";
import AnalyticsHeatmap from "@/screens/analytics/ui/AnalyticsHeatmap";
import AnalyticsScreenHeader from "@/screens/analytics/ui/AnalyticsScreenHeader";
import AnalyticsTopPostsTable from "@/screens/analytics/ui/AnalyticsTopPostsTable";
import { useAnalyticsScreen } from "@/screens/analytics/model/useAnalyticsScreen";

export default function AnalyticsScreen() {
  const analytics = useAnalyticsScreen();

  return (
    <>
      <AnalyticsScreenHeader {...analytics} />
      <div className="analytics-page" id="screen-analytics">
        <div className="analytics-scroll-inner">
          <ChannelAnalyticsSection
            periodIndex={analytics.period}
            periods={analytics.periods}
            onPeriodChange={analytics.setPeriod}
          />
          <AnalyticsHeatmap />
          <AnalyticsTopPostsTable
            isMobile={analytics.isMobile}
            posts={analytics.rankedTopPosts}
            metrics={analytics.topPostsTableMetrics}
            wrapStyle={analytics.topPostsTableWrapStyle}
            gridStyle={analytics.topPostsDesktopGridStyle}
            onOpenPost={analytics.openPost}
          />
        </div>
      </div>
    </>
  );
}
