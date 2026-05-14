"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import PageHeader from "../PageHeader";

const PERIODS = ["Сегодня", "7 дней", "30 дней", "90 дней", "Всё время"];

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
          </div>
          <div className="analytics-card">
            <div className="section-title">По рубрикам</div>
            <Bar label="Психология денег" cls="" width="100%" value="6 200" />
            <Bar label="Разбор" cls="o" width="77%" value="4 800" />
            <Bar label="Личный опыт" cls="g" width="63%" value="3 900" />
            <Bar label="Новости" cls="p" width="34%" value="2 100" />
          </div>
          <div className="analytics-card">
            <div className="section-title">Лучшие посты за период</div>
            <table className="top-table">
              <thead>
                <tr>
                  <th>Пост</th>
                  <th>Охваты</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Синдром чистого листа с деньгами</td>
                  <td>5 100</td>
                  <td>
                    <span className="top-link" onClick={() => openPost(1)}>
                      →
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Почему ИИС — не страшно</td>
                  <td>4 200</td>
                  <td>
                    <span className="top-link" onClick={() => openPost(2)}>
                      →
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Личный опыт с ETF</td>
                  <td>3 800</td>
                  <td>
                    <span className="top-link">→</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Bar({ label, cls, width, value }: { label: string; cls: string; width: string; value: string }) {
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className={`bar-fill ${cls}`} style={{ width }} />
      </div>
      <div className="bar-val">{value}</div>
    </div>
  );
}
