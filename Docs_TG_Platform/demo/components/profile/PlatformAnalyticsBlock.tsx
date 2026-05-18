"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { AiProfileConfig, LlmModel } from "@/lib/types";

const PERIODS = [
  { label: "Сегодня", multiplier: 0.06 },
  { label: "7 дней", multiplier: 0.24 },
  { label: "30 дней", multiplier: 1 },
  { label: "90 дней", multiplier: 2.8 },
  { label: "Всё время", multiplier: 7.4 },
];

const PERIOD_CHART_LABELS = [
  ["00", "06", "12", "18", "Сейчас"],
  ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  ["1 нед", "2 нед", "3 нед", "4 нед", "Сейчас"],
  ["Янв", "Фев", "Мар", "Апр", "Май"],
  ["Q1", "Q2", "Q3", "Q4", "Сейчас"],
];

type ModelTypeId = "llm" | "web" | "orchestrator" | "webReasoner" | "ragReasoner";

const MODEL_TYPES: { id: ModelTypeId; label: string; hint: string }[] = [
  { id: "llm", label: "LLM", hint: "генерация ответов и постов" },
  { id: "web", label: "Web Search", hint: "поиск и сбор источников" },
  { id: "orchestrator", label: "Оркестратор", hint: "маршрутизация сценариев" },
  { id: "webReasoner", label: "Web Reasoner", hint: "рассуждения поверх web-источников" },
  { id: "ragReasoner", label: "RAG Reasoner", hint: "рассуждения поверх базы знаний" },
];

const MODEL_LINE_COLORS = [
  "#3d7cff",
  "#4caf82",
  "#e8954a",
  "#9b7cdb",
  "#e85a5a",
  "#35b8d4",
  "#d7a935",
  "#7ccf68",
  "#c778dd",
  "#6f9dfb",
];

export default function PlatformAnalyticsBlock() {
  const { state } = useApp();
  const [period, setPeriod] = useState(2);
  const [modelType, setModelType] = useState<ModelTypeId>("llm");

  const modelUsage = useMemo(
    () => buildModelUsage(state.aiProfileConfig, PERIODS[period].multiplier),
    [state.aiProfileConfig, period],
  );
  const selectedTypeMeta = MODEL_TYPES.find((type) => type.id === modelType) ?? MODEL_TYPES[0];
  const selectedModels = modelUsage.filter((model) => model.type === modelType);
  const modelTotals = summarizeModelUsage(selectedModels);

  return (
    <>
      <div className="profile-section platform-analytics-section">
        <div className="analytics-card-head">
          <div>
            <div className="profile-section-title">Аналитика моделей</div>
            <div className="analytics-card-subtitle">
              По каждой модели, которая когда-либо использовалась на платформе
            </div>
          </div>
          <div className="model-filter-stack">
            <label className="platform-filter-label">
              <span>Период</span>
              <select
                className="platform-filter-select"
                value={period}
                onChange={(event) => setPeriod(Number(event.target.value))}
              >
                {PERIODS.map((item, i) => (
                  <option key={item.label} value={i}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="platform-filter-label">
              <span>Тип модели</span>
              <select
                className="platform-filter-select"
                value={modelType}
                onChange={(event) => setModelType(event.target.value as ModelTypeId)}
              >
                {MODEL_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="model-analytics-summary">
          <MiniMetric label="Запросы" value={formatNumber(modelTotals.calls)} />
          <MiniMetric label="Токены" value={formatCompact(modelTotals.tokens)} />
          <MiniMetric label="Стоимость" value={`$${modelTotals.cost.toFixed(2)}`} />
          <MiniMetric label="Успешность" value={`${modelTotals.success}%`} />
        </div>

        <div className="analytics-card-subtitle model-chart-hint">
          {selectedTypeMeta.label}: {selectedTypeMeta.hint}
        </div>
        <ModelTrendChart
          labels={PERIOD_CHART_LABELS[period]}
          rows={selectedModels}
          title={`Динамика запросов: ${selectedTypeMeta.label}`}
        />
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title">Модели за период</div>
        {selectedModels.map((model) => (
          <ModelUsageBar key={model.id} model={model} />
        ))}
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title">Детализация по моделям</div>
        <div className="platform-table-scroll">
          <table className="top-table model-usage-table">
            <thead>
              <tr>
                <th>Модель</th>
                <th>Роль</th>
                <th>Запросы</th>
                <th>Токены</th>
                <th>Стоимость</th>
                <th>Latency</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {selectedModels.map((model) => (
                <tr key={model.id}>
                  <td>{model.label}</td>
                  <td>{model.role}</td>
                  <td>{formatNumber(model.calls)}</td>
                  <td>{formatCompact(model.tokens)}</td>
                  <td>${model.cost.toFixed(2)}</td>
                  <td>{model.latency} мс</td>
                  <td>{model.active ? "Активна" : "Архив"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title">Активность платформы</div>
        <div className="profile-val" style={{ fontSize: 13, color: "var(--text2)" }}>
          Чатов создано: 12 &nbsp;•&nbsp; Заметок: 8 &nbsp;•&nbsp; Постов: 6
        </div>
      </div>
    </>
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

type ModelUsage = {
  id: string;
  label: string;
  role: string;
  type: ModelTypeId;
  active: boolean;
  calls: number;
  tokens: number;
  cost: number;
  success: number;
  latency: number;
  share: number;
  trend: number[];
  color: string;
};

function ModelTrendChart({
  labels,
  rows,
  title,
}: {
  labels: string[];
  rows: ModelUsage[];
  title: string;
}) {
  const max = Math.max(...rows.flatMap((model) => model.trend), 1);
  const chartRows = rows.map((model) => {
    const points = labels
      .map((_, i) => {
        const value = model.trend[i] ?? 0;
        const x = labels.length === 1 ? 132 : (264 / (labels.length - 1)) * i;
        const y = 88 - (value / max) * 70;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const dots = labels.map((_, i) => {
      const value = model.trend[i] ?? 0;
      return {
        x: labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100,
        y: 88 - (value / max) * 70,
        value,
        label: labels[i],
      };
    });

    return { ...model, points, dots };
  });

  return (
    <div className="trend-plot model-trend-plot">
      <div className="trend-chart-wrap">
        <svg
          className="trend-chart"
          viewBox="0 0 264 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={title}
        >
          <polyline className="trend-grid-line" points="0,88 264,88" />
          <polyline className="trend-grid-line" points="0,53 264,53" />
          <polyline className="trend-grid-line" points="0,18 264,18" />
          {chartRows.map((model) => (
            <polyline
              key={model.id}
              className="trend-line model-trend-line"
              points={model.points}
              style={{ stroke: model.color }}
            />
          ))}
        </svg>
        {chartRows.flatMap((model) =>
          model.dots.map((dot, i) => (
            <button
              key={`${model.id}-${labels[i]}-${dot.x}-${dot.y}`}
              className="trend-html-dot"
              type="button"
              aria-label={`${model.label}: ${formatNumber(dot.value)} запросов, ${dot.label}`}
              style={{ left: `${dot.x}%`, top: `${dot.y}%`, backgroundColor: model.color }}
            >
              <span className="trend-tooltip">
                <b>{model.label}</b>
                <span>{dot.label}</span>
                <em>{formatNumber(dot.value)} запросов</em>
              </span>
            </button>
          ))
        )}
      </div>
      <div className="trend-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function ModelUsageBar({ model }: { model: ModelUsage }) {
  return (
    <div className="bar-row model-usage-bar">
      <div className="bar-label">
        <span>{model.label}</span>
        <em>{model.role}</em>
      </div>
      <div className="bar-track">
        <div
          className={`bar-fill ${model.type}`}
          style={{ width: `${Math.max(model.share, 4)}%`, backgroundColor: model.color }}
        />
      </div>
      <div className="bar-val">{formatNumber(model.calls)}</div>
      <div className="bar-meta">{model.share}%</div>
    </div>
  );
}

function buildModelUsage(config: AiProfileConfig, periodMultiplier: number): ModelUsage[] {
  const models = [
    ...mapConfigModels(config.llmModels, "llm", "LLM"),
    ...mapConfigModels(config.webSearchModels, "web", "Web Search"),
    ...mapConfigModels(config.orchestratorModels, "orchestrator", "Оркестратор"),
    ...mapConfigModels(config.webReasonerModels, "webReasoner", "Web Reasoner"),
    ...mapConfigModels(config.ragReasonerModels, "ragReasoner", "RAG Reasoner"),
  ];

  const usage = models.map((model) => {
    const seed = hashString(`${model.id}:${model.label}:${model.role}`);
    const baseCalls = 130 + (seed % 760);
    const activityBoost = model.active ? 1 : 0.36;
    const calls = Math.round(baseCalls * periodMultiplier * activityBoost);
    const tokensPerCall = 640 + (seed % 1900);
    const trend = buildTrend(seed, calls);

    return {
      ...model,
      calls,
      tokens: Math.round(calls * tokensPerCall),
      cost: calls * tokensPerCall * (0.0000018 + (seed % 7) * 0.00000022),
      success: 91 + (seed % 8),
      latency: 620 + (seed % 740),
      share: 0,
      trend,
      color: "",
    };
  });

  const totalsByType = usage.reduce<Record<ModelTypeId, number>>(
    (acc, model) => ({ ...acc, [model.type]: acc[model.type] + model.calls }),
    { llm: 0, web: 0, orchestrator: 0, webReasoner: 0, ragReasoner: 0 },
  );

  return usage
    .map((model) => ({
      ...model,
      share: totalsByType[model.type] > 0 ? Math.round((model.calls / totalsByType[model.type]) * 100) : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .map((model, i) => ({
      ...model,
      color: MODEL_LINE_COLORS[i % MODEL_LINE_COLORS.length],
    }));
}

function mapConfigModels(models: LlmModel[], type: ModelTypeId, role: string) {
  return models
    .filter((model) => model.provider && model.model)
    .map((model) => ({
      id: `${type}-${role}-${model.id}`,
      label: `${model.provider} / ${model.model}`,
      role,
      type,
      active: model.active,
    }));
}

function buildTrend(seed: number, total: number) {
  const weights = [0.72, 0.88, 0.78, 1.05, 0.94, 1.16, 1.28].map(
    (weight, i) => weight + ((seed >> i) % 5) * 0.035,
  );
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => Math.max(1, Math.round((total * weight) / weightTotal)));
}

function summarizeModelUsage(models: ModelUsage[]) {
  const calls = models.reduce((sum, model) => sum + model.calls, 0);
  const tokens = models.reduce((sum, model) => sum + model.tokens, 0);
  const cost = models.reduce((sum, model) => sum + model.cost, 0);
  const success =
    calls > 0
      ? Math.round(models.reduce((sum, model) => sum + model.success * model.calls, 0) / calls)
      : 0;

  return { calls, tokens, cost, success };
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => {
    const nextHash = (hash << 5) - hash + char.charCodeAt(0);
    return nextHash >>> 0;
  }, 2166136261);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
