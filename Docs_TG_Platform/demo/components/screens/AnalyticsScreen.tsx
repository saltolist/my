"use client";

import { Fragment, useMemo, useState, type CSSProperties } from "react";
import { useApp } from "@/state/AppContext";
import ChannelAnalyticsSection from "@/components/analytics/ChannelAnalyticsSection";
import {
  formatChannelPostMetricValue,
  getChannelTopPostsTableMetrics,
} from "@/lib/channelAnalyticsTrend";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePageHeaderLe780 } from "@/lib/hooks/usePageHeaderLe780";
import PageHeader from "../PageHeader";
import PageHeaderSelect from "../PageHeaderSelect";

type TopPostRow = {
  id: number;
  title: string;
  subscribers: number;
  reactions: number;
  views: number;
  comments: number;
  reposts: number;
  er: number;
};

const PERIODS = ["24 часа", "7 дней", "30 дней", "90 дней", "Всё время"];

const heatmapRows = [
  { day: "Пн", values: [1, 2, 3, 4, 3] },
  { day: "Вт", values: [1, 3, 4, 5, 4] },
  { day: "Ср", values: [2, 2, 3, 4, 5] },
  { day: "Чт", values: [1, 3, 4, 4, 3] },
  { day: "Пт", values: [1, 2, 3, 5, 4] },
  { day: "Сб", values: [2, 3, 3, 4, 3] },
  { day: "Вс", values: [2, 3, 4, 4, 5] },
];

const topPosts: TopPostRow[] = [
  {
    id: 1,
    title: "Синдром чистого листа с деньгами",
    subscribers: 51,
    reactions: 917,
    views: 5100,
    comments: 48,
    reposts: 23,
    er: 6.4,
  },
  {
    id: 2,
    title: "Почему ИИС — не страшно",
    subscribers: 34,
    reactions: 612,
    views: 4200,
    comments: 31,
    reposts: 18,
    er: 5.1,
  },
  {
    id: 5,
    title: "Личный опыт с ETF",
    subscribers: 28,
    reactions: 488,
    views: 3800,
    comments: 22,
    reposts: 14,
    er: 5.8,
  },
];

export default function AnalyticsScreen() {
  const { openPost } = useApp();
  const [period, setPeriod] = useState(1);
  const isMobile = useMobile760();
  const isHeaderLe780 = usePageHeaderLe780();
  const topPostsTableMetrics = useMemo(
    () => getChannelTopPostsTableMetrics(isMobile || isHeaderLe780),
    [isMobile, isHeaderLe780],
  );
  const rankedTopPosts = useMemo(
    () => [...topPosts].sort((a, b) => b.subscribers - a.subscribers),
    [],
  );
  const topPostsDesktopGridStyle = useMemo(
    () =>
      ({
        gridTemplateColumns: `minmax(11rem, 1fr) repeat(${topPostsTableMetrics.length}, auto) minmax(3.25rem, max-content)`,
      }) as CSSProperties,
    [topPostsTableMetrics.length],
  );

  return (
    <>
      <PageHeader
        title="Аналитика канала"
        backTo="home"
        mobileSelect={
          isMobile ? (
            <PageHeaderSelect
              ariaLabel="Период аналитики"
              value={String(period)}
              options={PERIODS.map((p, i) => ({ value: String(i), label: p }))}
              onChange={(v) => setPeriod(Number(v))}
            />
          ) : undefined
        }
      />
      <div className="analytics-page" id="screen-analytics">
        <div className="analytics-scroll-inner">
          <ChannelAnalyticsSection
            periodIndex={period}
            periods={PERIODS}
            onPeriodChange={setPeriod}
          />

          <div className="analytics-card platform-analytics-section">
            <div className="profile-section-title platform-section-title-spaced">Тепловая карта активности</div>
            <div className="analytics-card-subtitle">Средний отклик по дням и времени публикации</div>
            <Heatmap />
          </div>

          <div className="analytics-card analytics-top-posts-card platform-analytics-section">
            <div className="profile-section-title platform-section-title-spaced">Лучшие посты за период</div>
            <div
              className="analytics-top-posts-table-wrap"
              style={
                {
                  "--top-posts-metric-cols": topPostsTableMetrics.length,
                } as CSSProperties
              }
            >
              {isMobile ? (
                <table className="top-table analytics-top-posts-table">
                  <colgroup>
                    <col className="analytics-top-posts-col-title" />
                    {topPostsTableMetrics.map((metric) => (
                      <col key={metric.id} className="analytics-top-posts-col-metric" />
                    ))}
                    <col className="analytics-top-posts-col-action" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Пост</th>
                      {topPostsTableMetrics.map((metric) => (
                        <th key={metric.id}>{metric.label}</th>
                      ))}
                      <th className="analytics-top-posts-cell-action" aria-label="Открыть пост" />
                    </tr>
                  </thead>
                  <tbody>
                    {rankedTopPosts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.title}</td>
                        {topPostsTableMetrics.map((metric) => (
                          <td key={metric.id}>
                            {formatChannelPostMetricValue(
                              metric.id,
                              post[metric.id as keyof TopPostRow] as number,
                            )}
                          </td>
                        ))}
                        <td className="analytics-top-posts-cell-action">
                          <span className="top-link" onClick={() => openPost(post.id)}>
                            →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div
                  className="analytics-top-posts-grid top-table"
                  role="table"
                  style={topPostsDesktopGridStyle}
                >
                  <div
                    className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--title analytics-top-posts-grid-cell--head"
                    role="columnheader"
                  >
                    Пост
                  </div>
                  {topPostsTableMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--metric analytics-top-posts-grid-cell--head"
                      role="columnheader"
                    >
                      {metric.label}
                    </div>
                  ))}
                  <div
                    className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--action analytics-top-posts-grid-cell--head analytics-top-posts-cell-action"
                    role="columnheader"
                  >
                    к посту
                  </div>
                  <div className="analytics-top-posts-grid-line" aria-hidden />
                  {rankedTopPosts.map((post, rowIndex) => (
                    <Fragment key={post.id}>
                      <div
                        className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--title analytics-top-posts-grid-cell--body"
                        role="cell"
                      >
                        {post.title}
                      </div>
                      {topPostsTableMetrics.map((metric) => (
                        <div
                          key={`${post.id}-${metric.id}`}
                          className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--metric analytics-top-posts-grid-cell--body"
                          role="cell"
                        >
                          {formatChannelPostMetricValue(
                            metric.id,
                            post[metric.id as keyof TopPostRow] as number,
                          )}
                        </div>
                      ))}
                      <div
                        key={`${post.id}-action`}
                        className="analytics-top-posts-grid-cell analytics-top-posts-grid-cell--action analytics-top-posts-grid-cell--body"
                        role="cell"
                      >
                        <span className="top-link" onClick={() => openPost(post.id)}>
                          →
                        </span>
                      </div>
                      {rowIndex < rankedTopPosts.length - 1 ? (
                        <div className="analytics-top-posts-grid-line" aria-hidden />
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Heatmap() {
  return (
    <div className="heatmap">
      <div className="heatmap-head">
        <span />
        {["09", "12", "15", "18", "21"].map((hour) => (
          <span key={hour}>{hour}</span>
        ))}
      </div>
      {heatmapRows.map((row) => (
        <div className="heatmap-row" key={row.day}>
          <span className="heatmap-day">{row.day}</span>
          {row.values.map((level, i) => (
            <span key={`${row.day}-${i}`} className={`heatmap-cell heatmap-level-${level}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
