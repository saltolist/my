"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import PageHeader from "../PageHeader";

const PERIODS = ["7 дней", "30 дней", "90 дней", "Всё время"];

const trendPoints = "0,82 44,68 88,74 132,42 176,48 220,30 264,18";

const rubricStats = [
  { label: "Психология денег", width: "100%", value: "6 200", meta: "ER 5.6%", cls: "" },
  { label: "Разбор", width: "77%", value: "4 800", meta: "ER 4.9%", cls: "o" },
  { label: "Личный опыт", width: "63%", value: "3 900", meta: "ER 6.1%", cls: "g" },
  { label: "Новости", width: "34%", value: "2 100", meta: "ER 3.2%", cls: "p" },
];

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

          <div className="analytics-dashboard-grid">
            <div className="analytics-card analytics-card-wide">
              <div className="section-title">Динамика охватов</div>
              <div className="analytics-card-subtitle">Публикации недели, просмотры по дням</div>
              <div className="trend-plot">
                <svg className="trend-chart" viewBox="0 0 264 100" role="img" aria-label="Рост охватов по дням">
                  <polyline className="trend-grid-line" points="0,82 264,82" />
                  <polyline className="trend-grid-line" points="0,50 264,50" />
                  <polyline className="trend-grid-line" points="0,18 264,18" />
                  <polyline className="trend-line" points={trendPoints} />
                  {trendPoints.split(" ").map((point) => {
                    const [cx, cy] = point.split(",");
                    return <circle key={point} className="trend-dot" cx={cx} cy={cy} r="3" />;
                  })}
                </svg>
                <div className="trend-labels">
                  <span>Пн</span>
                  <span>Вт</span>
                  <span>Ср</span>
                  <span>Чт</span>
                  <span>Пт</span>
                  <span>Сб</span>
                  <span>Вс</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="section-title">Рост канала</div>
              <div className="analytics-metric-list">
                <MetricRow label="Новые подписчики" value="+214" delta="+18%" />
                <MetricRow label="Отписки" value="−43" delta="−7%" />
                <MetricRow label="Net growth" value="+171" delta="+26%" />
                <MetricRow label="Лучший источник" value="Репосты" delta="42%" />
              </div>
            </div>
          </div>

          <div className="analytics-dashboard-grid">
            <div className="analytics-card">
              <div className="section-title">Вовлечённость</div>
              <div className="engagement-grid">
                <MiniMetric label="Реакции" value="1 286" />
                <MiniMetric label="Комментарии" value="94" />
                <MiniMetric label="Репосты" value="61" />
                <MiniMetric label="ER постов" value="4.8%" />
              </div>
              <div className="reaction-strip" aria-label="Популярные реакции">
                <span>🔥 412</span>
                <span>❤ 134</span>
                <span>👍 222</span>
                <span>🤔 34</span>
              </div>
            </div>

            <div className="analytics-card">
              <div className="section-title">Тепловая карта активности</div>
              <div className="analytics-card-subtitle">Средний отклик по дням и времени публикации</div>
              <Heatmap />
            </div>
          </div>

          <div className="analytics-card">
            <div className="section-title">По рубрикам</div>
            {rubricStats.map((rubric) => (
              <Bar key={rubric.label} {...rubric} />
            ))}
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

function MetricRow({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="analytics-metric-row">
      <span>{label}</span>
      <b>{value}</b>
      <em className="delta-up">{delta}</em>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-metric">
      <div className="mini-metric-value">{value}</div>
      <div className="mini-metric-label">{label}</div>
    </div>
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

function Bar({
  label,
  cls,
  width,
  value,
  meta,
}: {
  label: string;
  cls: string;
  width: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className={`bar-fill ${cls}`} style={{ width }} />
      </div>
      <div className="bar-val">{value}</div>
      <div className="bar-meta">{meta}</div>
    </div>
  );
}
