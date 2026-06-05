"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import ChartSeriesSelector from "@/components/charts/ChartSeriesSelector";
import ModelPicker from "@/components/composer/ModelPicker";
import MultiSeriesTrendChart, { type TrendSeriesRow } from "@/components/charts/MultiSeriesTrendChart";
import { useChartSeriesVisibility } from "@/lib/hooks/useChartSeriesVisibility";
import { useDomain } from "@/state/domain-store";
import type { AiProfileConfig, LlmModel } from "@/lib/types";
import { formatTrendDollar } from "@/lib/trendChart/math";
import {
  getPeriodChartLabels,
  resolveTrendChartMaxPoints,
} from "@/lib/trendChart/periodLabels";
import { usePageHeaderLe1080 } from "@/lib/hooks/usePageHeaderLe1080";
import { usePageHeaderLe640 } from "@/lib/hooks/usePageHeaderLe640";
import { useAnchoredBarRowTooltip } from "@/lib/hooks/useAnchoredBarRowTooltip";
import { useDesktopBarTooltipPortal } from "@/lib/hooks/useDesktopBarTooltipPortal";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { PLATFORM_ANALYTICS_PERIODS } from "@/lib/platformAnalyticsPeriods";
import {
  PLATFORM_MODEL_FILTERS,
  PLATFORM_MODEL_TYPE_OPTIONS,
  type ModelFilterId,
  type ModelTypeId,
} from "@/lib/platformModelFilters";

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

type Props = {
  period: number;
  onPeriodChange: (next: number) => void;
  periodInHeader?: boolean;
};

export default function PlatformAnalyticsBlock({
  period,
  onPeriodChange,
  periodInHeader = false,
}: Props) {
  const { state } = useDomain();
  const isMobile = useMobile760();
  const isHeaderLe1080 = usePageHeaderLe1080();
  const isHeaderLe640 = usePageHeaderLe640();
  const [modelType, setModelType] = useState<ModelFilterId>("all");
  const chartMaxPoints = resolveTrendChartMaxPoints({
    isMobile,
    isHeaderLe1080,
    isHeaderLe640,
  });

  const chartLabels = useMemo(
    () => getPeriodChartLabels(period, { maxPoints: chartMaxPoints }),
    [period, chartMaxPoints],
  );
  const modelUsage = useMemo(
    () =>
      buildModelUsage(
        state.aiProfileConfig,
        PLATFORM_ANALYTICS_PERIODS[period].multiplier,
        chartLabels.length,
      ),
    [state.aiProfileConfig, period, chartLabels.length],
  );
  const selectedTypeMeta =
    PLATFORM_MODEL_FILTERS.find((type) => type.id === modelType) ?? PLATFORM_MODEL_FILTERS[0];
  const isAllTypes = modelType === "all";
  const selectedModels = isAllTypes
    ? buildTypeUsage(modelUsage)
    : modelUsage.filter((model) => model.type === modelType);
  const modelTotals = summarizeModelUsage(selectedModels);
  const costTrendSeries = useMemo(
    (): TrendSeriesRow[] =>
      selectedModels.map((model) => ({
        id: model.id,
        label: model.label,
        color: model.color,
        values: model.trend,
        yValues: model.trend.map((_, index) => getTrendPointCost(model, index)),
      })),
    [selectedModels],
  );
  const seriesIds = useMemo(() => selectedModels.map((model) => model.id), [selectedModels]);
  const { isVisible, setVisible, filterSeries } = useChartSeriesVisibility(seriesIds);
  const visibleCostTrendSeries = useMemo(
    () => filterSeries(costTrendSeries),
    [costTrendSeries, filterSeries],
  );
  const selectorItems = useMemo(
    () =>
      selectedModels.map((model) => ({
        id: model.id,
        label: model.label,
        color: model.color,
      })),
    [selectedModels],
  );
  const chartTitle = `Динамика стоимости: ${selectedTypeMeta.label}`;

  return (
    <>
      <div className="profile-section platform-analytics-section profile-checkbox-scope">
        <div className="analytics-card-head">
          <div>
            <div className="profile-section-title">Аналитика моделей</div>
          </div>
          <div className="model-filter-stack model-filter-stack--with-series">
            <ModelPicker
              ariaLabel="Тип модели"
              className="profile-model-picker"
              value={modelType}
              options={PLATFORM_MODEL_FILTERS.map((type) => ({
                id: type.id,
                label: type.label,
              }))}
              placement="down"
              onChange={(id) => setModelType(id as ModelFilterId)}
            />
            <ChartSeriesSelector
              variant="profile"
              label="Модели"
              items={selectorItems}
              isVisible={isVisible}
              onVisibleChange={setVisible}
            />
            {!periodInHeader ? (
              <ModelPicker
                ariaLabel="Период"
                className="profile-model-picker platform-period-picker--in-card"
                value={String(period)}
                options={PLATFORM_ANALYTICS_PERIODS.map((item, index) => ({
                  id: String(index),
                  label: item.label,
                }))}
                placement="down"
                onChange={(id) => onPeriodChange(Number(id))}
              />
            ) : null}
          </div>
        </div>

        <div className="model-analytics-summary">
          <MiniMetric label="Запросы" value={formatNumber(modelTotals.calls)} />
          <MiniMetric label="Токены" value={formatCompact(modelTotals.tokens)} />
          <MiniMetric label="Стоимость" value={`$${modelTotals.cost.toFixed(2)}`} />
        </div>

        <div className="section-title analytics-chart-title">{chartTitle}</div>
        <MultiSeriesTrendChart
          labels={chartLabels}
          series={visibleCostTrendSeries}
          period={period}
          compactAxisLabels={period === 0 || period === 2 || period === 3}
          title={chartTitle}
          formatAxisValue={formatTrendDollar}
          getDotPrimaryLine={(_, value) => `${formatNumber(value)} запросов`}
          getDotExtraLines={(row, value, pointIndex) => {
            const model = selectedModels.find((item) => item.id === row.id);
            if (!model) return [];
            const ratio = model.calls > 0 ? value / model.calls : 0;
            const tokens = Math.round(model.tokens * ratio);
            const cost = getTrendPointCost(model, pointIndex);
            return [
              `${formatCompact(tokens)} токенов`,
              formatTrendDollar(cost, cost),
            ];
          }}
        />
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title platform-section-title-spaced">
          {isAllTypes ? "Типы моделей за период" : "Модели за период"}
        </div>
        <div className="model-usage-grid">
          <div className="model-usage-head">
            <span>{isAllTypes ? "Тип" : "Модель"}</span>
            <span className="model-usage-head-bar" aria-hidden />
            <span>Запросы</span>
            <span>Токены</span>
            <span>Стоимость</span>
          </div>
          {selectedModels.map((model) => (
            <ModelUsageBar key={model.id} model={model} totals={modelTotals} />
          ))}
        </div>
      </div>

      <div className="profile-section platform-analytics-section">
        <div className="profile-section-title platform-section-title-spaced">Активность платформы</div>
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
      <div className="mini-metric-label">{label}</div>
      <div className="mini-metric-value">{value}</div>
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

function getTrendPointCost(model: ModelUsage, index: number) {
  const value = model.trend[index] ?? 0;
  const ratio = model.calls > 0 ? value / model.calls : 0;
  return model.cost * ratio;
}


function ModelUsageTooltipBody({
  model,
  callsShare,
  tokensShare,
  costShare,
}: {
  model: ModelUsage;
  callsShare: number;
  tokensShare: number;
  costShare: number;
}) {
  return (
    <>
      <b>{model.label}</b>
      <span>Запросы: {callsShare}%</span>
      <span>Токены: {tokensShare}%</span>
      <span>Стоимость: {costShare}%</span>
    </>
  );
}

function ModelUsageBar({
  model,
  totals,
}: {
  model: ModelUsage;
  totals: ReturnType<typeof summarizeModelUsage>;
}) {
  const isMobile = useMobile760();
  const { rowRef, open, mobileHandlers } = useAnchoredBarRowTooltip(isMobile);
  const { desktopTooltipPos, desktopTooltipHandlers } = useDesktopBarTooltipPortal(!isMobile);
  const callsShare = totals.calls > 0 ? Math.round((model.calls / totals.calls) * 100) : 0;
  const tokensShare = totals.tokens > 0 ? Math.round((model.tokens / totals.tokens) * 100) : 0;
  const costShare = totals.cost > 0 ? Math.round((model.cost / totals.cost) * 100) : 0;
  const fillShare = Math.round((callsShare + tokensShare + costShare) / 3);

  return (
    <div
      ref={rowRef}
      className={`bar-row model-usage-bar${open && isMobile ? " bar-row--tooltip-open" : ""}`}
      style={{ "--bar-row-color": model.color } as CSSProperties}
      tabIndex={isMobile ? 0 : undefined}
      aria-expanded={isMobile ? open : undefined}
      {...(isMobile ? mobileHandlers : {})}
    >
      <div className="bar-label">
        <span className="bar-label-text-clip">{model.label}</span>
        {isMobile && open ? (
          <div className="model-usage-tooltip model-usage-tooltip--anchored-row">
            <ModelUsageTooltipBody
              model={model}
              callsShare={callsShare}
              tokensShare={tokensShare}
              costShare={costShare}
            />
          </div>
        ) : null}
      </div>
      <div
        className="bar-track model-usage-track"
        tabIndex={isMobile ? undefined : 0}
        style={{ "--fill-width": `${Math.max(fillShare, 4)}%` } as CSSProperties}
        {...(isMobile ? {} : desktopTooltipHandlers)}
      >
        <div
          className={`bar-fill ${model.type}`}
          style={{ "--bar-color": model.color, backgroundColor: model.color } as CSSProperties}
        />
      </div>
      <div className="model-row-metric model-row-metric--calls">{formatNumber(model.calls)}</div>
      <div className="model-row-metric model-row-metric--tokens">{formatCompact(model.tokens)}</div>
      <div className="model-row-metric model-row-metric--cost">${model.cost.toFixed(2)}</div>
      {!isMobile && desktopTooltipPos && typeof document !== "undefined"
        ? createPortal(
            <div
              className="model-usage-tooltip"
              style={{ left: desktopTooltipPos.x, top: desktopTooltipPos.y }}
            >
              <ModelUsageTooltipBody
                model={model}
                callsShare={callsShare}
                tokensShare={tokensShare}
                costShare={costShare}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function buildModelUsage(
  config: AiProfileConfig,
  periodMultiplier: number,
  trendPointCount = 7,
): ModelUsage[] {
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
    const trend = buildTrend(seed, calls, trendPointCount);

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

function buildTypeUsage(models: ModelUsage[]): ModelUsage[] {
  const totalCalls = models.reduce((sum, model) => sum + model.calls, 0);

  return PLATFORM_MODEL_TYPE_OPTIONS.map((type, i) => {
    const rows = models.filter((model) => model.type === type.id);
    if (rows.length === 0) return null;

    const calls = rows.reduce((sum, model) => sum + model.calls, 0);
    const tokens = rows.reduce((sum, model) => sum + model.tokens, 0);
    const cost = rows.reduce((sum, model) => sum + model.cost, 0);
    const latency =
      calls > 0
        ? Math.round(rows.reduce((sum, model) => sum + model.latency * model.calls, 0) / calls)
        : 0;
    const success =
      calls > 0
        ? Math.round(rows.reduce((sum, model) => sum + model.success * model.calls, 0) / calls)
        : 0;
    const trendLength = Math.max(...rows.map((model) => model.trend.length), 0);
    const trend = Array.from({ length: trendLength }, (_, trendIndex) =>
      rows.reduce((sum, model) => sum + (model.trend[trendIndex] ?? 0), 0),
    );

    return {
      id: `type-${type.id}`,
      label: type.label,
      role: "Тип моделей",
      type: type.id,
      active: rows.some((model) => model.active),
      calls,
      tokens,
      cost,
      success,
      latency,
      share: totalCalls > 0 ? Math.round((calls / totalCalls) * 100) : 0,
      trend,
      color: MODEL_LINE_COLORS[i % MODEL_LINE_COLORS.length],
    };
  }).filter((model): model is ModelUsage => model !== null);
}

function buildTrend(seed: number, total: number, pointCount = 7) {
  const weights = Array.from({ length: pointCount }, (_, i) => {
    const progress = pointCount === 1 ? 0 : i / (pointCount - 1);
    const weight = 0.72 + progress * 0.56;
    return weight + ((seed >> (i % 8)) % 5) * 0.035;
  });
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
