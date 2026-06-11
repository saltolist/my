"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, type CSSProperties } from "react";

import { useNavigationStore } from "@/app/model/store";
import { ANALYTICS_TOP_POSTS_SEED } from "@/shared/data/analyticsSeedData";
import {
  analyticsIndexToPeriod,
  analyticsPeriodToIndex,
  ANALYTICS_PERIOD_LABELS,
} from "@/shared/lib/analyticsPeriod";
import { getChannelTopPostsTableMetrics } from "@/shared/lib/channelAnalyticsTrend";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { routes } from "@/shared/lib/routes";
import type { AnalyticsPeriod } from "@/shared/data/analytics-seed";
import { usePageHeaderLe780 } from "@/widgets/page-header";

export function useAnalyticsScreen() {
  const router = useRouter();
  const period = useNavigationStore((s) => s.analyticsPeriod);
  const setAnalyticsPeriod = useNavigationStore((s) => s.setAnalyticsPeriod);
  const isMobile = useMobile760();
  const isHeaderLe780 = usePageHeaderLe780();

  const periodIndex = analyticsPeriodToIndex(period);

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
      value: period,
      options: ANALYTICS_PERIOD_LABELS.map((label, i) => ({
        value: analyticsIndexToPeriod(i),
        label,
      })),
      onChange: (v: string) => setAnalyticsPeriod(v as AnalyticsPeriod),
    }),
    [period, setAnalyticsPeriod],
  );

  const setPeriodIndex = useCallback(
    (index: number) => {
      setAnalyticsPeriod(analyticsIndexToPeriod(index));
    },
    [setAnalyticsPeriod],
  );

  const openPost = useCallback(
    (postId: number) => {
      router.push(routes.post(postId));
    },
    [router],
  );

  return {
    data: {
      period,
      periodIndex,
      periods: ANALYTICS_PERIOD_LABELS,
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
      setPeriod: setPeriodIndex,
      openPost,
    },
  };
}

export type AnalyticsScreenState = ReturnType<typeof useAnalyticsScreen>;
