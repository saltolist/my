"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useNavigation } from "@/app/model/store";
import { ANALYTICS_TOP_POSTS_SEED } from "@/shared/lib/analyticsSeedData";
import { getChannelTopPostsTableMetrics } from "@/shared/lib/channelAnalyticsTrend";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { usePageHeaderLe780 } from "@/widgets/page-header";
import { PLATFORM_ANALYTICS_PERIODS } from "@/shared/lib/platformAnalyticsPeriods";

const PERIOD_LABELS = PLATFORM_ANALYTICS_PERIODS.map((item) => item.label);

export function useAnalyticsScreen() {
  const { openPost } = useNavigation();
  const [period, setPeriod] = useState(1);
  const isMobile = useMobile760();
  const isHeaderLe780 = usePageHeaderLe780();

  const topPostsTableMetrics = useMemo(
    () => getChannelTopPostsTableMetrics(isMobile || isHeaderLe780),
    [isMobile, isHeaderLe780],
  );

  const rankedTopPosts = useMemo(
    () => [...ANALYTICS_TOP_POSTS_SEED].sort((a, b) => b.subscribers - a.subscribers),
    [],
  );

  const topPostsDesktopGridStyle = useMemo(
    () =>
      ({
        gridTemplateColumns: `minmax(11rem, 1fr) repeat(${topPostsTableMetrics.length}, auto) minmax(3.25rem, max-content)`,
      }) as CSSProperties,
    [topPostsTableMetrics.length],
  );

  const topPostsTableWrapStyle = useMemo(
    () =>
      ({
        "--top-posts-metric-cols": topPostsTableMetrics.length,
      }) as CSSProperties,
    [topPostsTableMetrics.length],
  );

  const periodSelectProps = useMemo(
    () => ({
      ariaLabel: "Период аналитики",
      value: String(period),
      options: PERIOD_LABELS.map((label, i) => ({ value: String(i), label })),
      onChange: (v: string) => setPeriod(Number(v)),
    }),
    [period],
  );

  return {
    data: {
      period,
      periods: PERIOD_LABELS,
      topPostsTableMetrics,
      rankedTopPosts,
      topPostsDesktopGridStyle,
      topPostsTableWrapStyle,
    },
    ui: {
      isMobile,
      periodSelectProps,
    },
    actions: {
      setPeriod,
      openPost,
    },
  };
}

export type AnalyticsScreenState = ReturnType<typeof useAnalyticsScreen>;
