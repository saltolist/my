"use client";

import ChannelAnalyticsSection from "@/components/analytics/ChannelAnalyticsSection";
import AnalyticsHeatmap from "@/components/screens/analytics/AnalyticsHeatmap";
import AnalyticsScreenHeader from "@/components/screens/analytics/AnalyticsScreenHeader";
import AnalyticsTopPostsTable from "@/components/screens/analytics/AnalyticsTopPostsTable";
import { useAnalyticsScreen } from "@/lib/hooks/useAnalyticsScreen";

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
