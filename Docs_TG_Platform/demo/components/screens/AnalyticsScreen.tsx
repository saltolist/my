"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import ChannelMetricBars from "@/components/analytics/ChannelMetricBars";
import ChannelReactionsPanel from "@/components/analytics/ChannelReactionsPanel";
import ChannelTrendChart from "@/components/analytics/ChannelTrendChart";
import PageHeader from "../PageHeader";

const PERIODS = ["7 дней", "30 дней", "90 дней", "Всё время"];

const heatmapRows = [
  { day: "Пн", values: [1, 2, 3, 4, 3] },
  { day: "Вт", values: [1, 3, 4, 5, 4] },
  { day: "Ср", values: [2, 2, 3, 4, 5] },
  { day: "Чт", values: [1, 3, 4, 4, 3] },
  { day: "Пт", values: [1, 2, 3, 5, 4] },
  { day: "Сб", values: [2, 3, 3, 4, 3] },
  { day: "Вс", values: [2, 3, 4, 4, 5] },
];

const topPosts = [
  {
    id: 1,
    title: "Синдром чистого листа с деньгами",
    rubric: "Психология денег",
    reach: "5 100",
    er: "6.4%",
    reposts: 23,
  },
  {
    id: 2,
    title: "Почему ИИС — не страшно",
    rubric: "Разбор",
    reach: "4 200",
    er: "5.1%",
    reposts: 18,
  },
  {
    id: 5,
    title: "Личный опыт с ETF",
    rubric: "Личный опыт",
    reach: "3 800",
    er: "5.8%",
    reposts: 14,
  },
];

export default function AnalyticsScreen() {
  const { openPost } = useApp();
  const [period, setPeriod] = useState(0);

  const periodToolbar = (
    <div className="page-header-analytics-periods" role="tablist" aria-label="Период">
      {PERIODS.map((p, i) => (
        <button
          key={p}
          type="button"
          role="tab"
          aria-selected={i === period}
          className={`period-tab${i === period ? " active" : ""}`}
          onClick={() => setPeriod(i)}
        >
          {p}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader title="Аналитика канала" backTo="home" search={periodToolbar} />
      <div className="analytics-page">
        <div className="analytics-scroll-inner">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Охваты</div>
              <div className="stat-value">38 200</div>
              <div className="stat-delta delta-up">↑ +12%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Подписчики</div>
              <div className="stat-value">8 412</div>
              <div className="stat-delta delta-up">↑ +34</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ER</div>
              <div className="stat-value">4.8%</div>
              <div className="stat-delta delta-up">↑ +0.3%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Средний охват</div>
              <div className="stat-value">4 775</div>
              <div className="stat-delta delta-up">↑ +9%</div>
            </div>
          </div>

          <div className="analytics-card analytics-chart-card">
            <div className="section-title">Динамика прироста</div>
            <div className="analytics-card-subtitle">
              Подписчики, просмотры, реакции, комментарии, репосты и ER по выбранному периоду
            </div>
            <ChannelTrendChart periodIndex={period} />
          </div>

          <div className="analytics-metrics-row">
            <div className="analytics-card">
              <ChannelMetricBars periodIndex={period} />
            </div>
            <div className="analytics-card channel-reactions-card">
              <ChannelReactionsPanel />
            </div>
          </div>

          <div className="analytics-card">
            <div className="section-title">Тепловая карта активности</div>
            <div className="analytics-card-subtitle">Средний отклик по дням и времени публикации</div>
            <Heatmap />
          </div>

          <div className="analytics-card">
            <div className="section-title">Лучшие посты за период</div>
            <table className="top-table">
              <thead>
                <tr>
                  <th>Пост</th>
                  <th>Рубрика</th>
                  <th>Охваты</th>
                  <th>ER</th>
                  <th>Репосты</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.rubric}</td>
                    <td>{post.reach}</td>
                    <td>{post.er}</td>
                    <td>{post.reposts}</td>
                    <td>
                      <span className="top-link" onClick={() => openPost(post.id)}>
                        →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
