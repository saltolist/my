"use client";

import { useMemo } from "react";
import { EyeIcon, FileTextIcon, TrendingUpIcon } from "lucide-react";

import { usePosts } from "@/entities/post/model/usePosts";
import { useChannelProfile } from "@/entities/channel/model/useProfile";
import {
  formatCompactDate,
  formatMetricNumber,
  getMetricsForPeriod,
  parseViewsMetric,
  type AnalyticsPeriod,
} from "@/shared/data/analytics-seed";
import { postTitle } from "@/shared/lib/postTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { SummaryMetricCard } from "@/shared/ui/summary-metric-card";
import { cn } from "@/shared/lib/utils";

import { SimpleLineChart } from "./SimpleLineChart";
import { RubricBreakdown } from "./ui/rubric-breakdown";
import { TopPostsList } from "./ui/top-posts-list";

type AnalyticsDashboardProps = {
  period: AnalyticsPeriod;
  onPostClick?: (postId: number) => void;
  className?: string;
};

export function AnalyticsDashboard({ period, onPostClick, className }: AnalyticsDashboardProps) {
  const { data: posts = [] } = usePosts();
  const { data: channelProfile } = useChannelProfile();

  const periodMetrics = useMemo(() => getMetricsForPeriod(period), [period]);

  const chartData = useMemo(
    () =>
      periodMetrics.map((day) => ({
        label: formatCompactDate(day.date),
        value: Math.max(day.views, 0),
      })),
    [periodMetrics],
  );

  const totalViews = useMemo(
    () => periodMetrics.reduce((sum, day) => sum + Math.max(day.views, 0), 0),
    [periodMetrics],
  );

  const totalPosts = useMemo(
    () => periodMetrics.reduce((sum, day) => sum + day.posts, 0),
    [periodMetrics],
  );

  const avgViews = periodMetrics.length > 0 ? totalViews / periodMetrics.length : 0;

  const publishedPosts = useMemo(
    () => posts.filter((post) => post.status === "published"),
    [posts],
  );

  const topPosts = useMemo(
    () =>
      [...publishedPosts]
        .sort((a, b) => parseViewsMetric(b.metrics?.views) - parseViewsMetric(a.metrics?.views))
        .slice(0, 5),
    [publishedPosts],
  );

  const bestPost = topPosts[0];

  const rubricBreakdown = useMemo(() => {
    const rubrics = channelProfile?.rubrics ?? [];
    const counts = new Map<string, number>();

    for (const rubric of rubrics) {
      counts.set(rubric.title, 0);
    }

    for (const post of publishedPosts) {
      if (post.rubric) {
        counts.set(post.rubric, (counts.get(post.rubric) ?? 0) + 1);
      }
    }

    if ([...counts.values()].every((count) => count === 0)) {
      rubrics.forEach((rubric, index) => {
        counts.set(rubric.title, Math.max(1, 4 - index));
      });
    }

    const total = [...counts.values()].reduce((sum, count) => sum + count, 0) || 1;

    return [...counts.entries()]
      .map(([title, count]) => ({
        title,
        count,
        share: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [channelProfile?.rubrics, publishedPosts]);

  return (
    <div className={cn("flex flex-col gap-6 p-4", className)}>
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetricCard
          label="Средние просмотры / день"
          value={formatMetricNumber(avgViews)}
          icon={<EyeIcon className="size-4" />}
        />
        <SummaryMetricCard
          label="Лучший пост"
          value={bestPost ? postTitle(bestPost) : "—"}
          icon={<TrendingUpIcon className="size-4" />}
        />
        <SummaryMetricCard
          label="Постов за период"
          value={formatMetricNumber(totalPosts)}
          icon={<FileTextIcon className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Просмотры по дням</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={chartData} ariaLabel="Динамика просмотров канала" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopPostsList posts={topPosts} onPostClick={onPostClick} />
        <RubricBreakdown rows={rubricBreakdown} />
      </div>
    </div>
  );
}
