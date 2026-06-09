# charts

**Путь:** `web-legacy/src/widgets/charts/`

Переиспользуемые SVG-графики.

---

## MultiSeriesTrendChart

### Props (key)

| Prop | Description |
|------|-------------|
| `labels` | X axis labels (dates) |
| `series` | TrendSeriesRow[] with id, label, color, values |
| `period` | Chart period enum (affects axis density) |
| `title` | Chart heading |
| `showYAxisLabels` | boolean |
| `compactAxisLabels` | Shorter date labels |
| `getDotGrowthBadge` | Tooltip formatter for dot |
| `getDotPrimaryLine` | Primary metric line in tooltip |
| `getDotPercentGrowthLine` | % change line |
| `getDotRangeFromStartLine` | Range from period start |

### Anatomy

```
chart title
SVG (TrendChartSvg)
  ├─ grid lines
  ├─ series paths
  ├─ TrendChartDotButton (interactive points)
  └─ TrendChartXLabels
TrendClusterTooltipPortal (hover tooltips)
```

### Dot clustering

When dots too dense — `dotClustering.ts` groups nearby points.

---

## ChartSeriesSelector

Profile-style dropdown to toggle series visibility.

| Prop | Description |
|------|-------------|
| `items` | `{ id, label, color }[]` |
| `isVisible(id)` | boolean |
| `onVisibleChange` | toggle handler |
| `label` | e.g. «Метрики» |
| `variant` | `profile` styling |

---

## TrendSeriesRow

```ts
{
  id: string
  label: string
  color: string
  values: number[]
  priorCumulative?: number
}
```

---

## Used in

| Location | Chart |
|----------|-------|
| ChannelAnalyticsSection | Channel growth multi-series |
| PlatformModelsChartSection | Model cost/usage trends |

---

## Helpers

`shared/lib/trendChart/`:
- `buildTrendChartRows`, `math`, `periodLabels`
- `channelAnalyticsTrend.ts` — domain-specific series builders

---

## Responsive

`resolveTrendChartMaxPoints()` limits dots based on:
- mobile
- header width breakpoints (640, 1080)
