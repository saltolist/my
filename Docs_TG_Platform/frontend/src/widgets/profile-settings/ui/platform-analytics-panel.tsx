"use client";

import { useMemo, useState } from "react";

import { useAiProfile } from "@/entities/channel/model/useProfile";
import {
  buildPlatformModelUsage,
  formatMetricNumber,
  PLATFORM_ANALYTICS_PERIOD_OPTIONS,
  type PlatformAnalyticsPeriod,
} from "@/shared/data/analytics-seed";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function PlatformAnalyticsPanel() {
  const { data: aiProfile } = useAiProfile();
  const [period, setPeriod] = useState<PlatformAnalyticsPeriod>("30d");

  const periodMeta = PLATFORM_ANALYTICS_PERIOD_OPTIONS.find((item) => item.value === period)!;

  const modelUsage = useMemo(() => {
    if (!aiProfile) return [];
    return buildPlatformModelUsage(aiProfile, periodMeta.multiplier);
  }, [aiProfile, periodMeta.multiplier]);

  const totals = useMemo(
    () =>
      modelUsage.reduce(
        (acc, model) => ({
          calls: acc.calls + model.calls,
          tokens: acc.tokens + model.tokens,
          cost: acc.cost + model.cost,
        }),
        { calls: 0, tokens: 0, cost: 0 },
      ),
    [modelUsage],
  );

  const maxTokens = Math.max(...modelUsage.map((m) => m.tokens), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Использование токенов</h3>
          <p className="text-sm text-muted-foreground">Mock-метрики по моделям платформы</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_ANALYTICS_PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={period === option.value ? "default" : "outline"}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Запросов</p>
            <p className="text-xl font-semibold tabular-nums">{formatMetricNumber(totals.calls)}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Токенов</p>
            <p className="text-xl font-semibold tabular-nums">{formatMetricNumber(totals.tokens)}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Стоимость, $</p>
            <p className="text-xl font-semibold tabular-nums">{totals.cost.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Модели по токенам</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {modelUsage.map((model) => (
            <div key={model.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{model.label}</p>
                  <p className="text-xs text-muted-foreground">{model.role}</p>
                </div>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatMetricNumber(model.tokens)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${Math.round((model.tokens / maxTokens) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
