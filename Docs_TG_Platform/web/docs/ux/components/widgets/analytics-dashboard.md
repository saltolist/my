# analytics-dashboard

**Путь:** `web-legacy/src/widgets/analytics-dashboard/`

Блоки метрик канала на экране `/analytics/`.

---

## Screen composition

```
AnalyticsScreenHeader
└─ analytics-page
   ├─ ChannelAnalyticsSection    ← widget
   ├─ AnalyticsHeatmap           ← screen component
   └─ AnalyticsTopPostsTable     ← screen component
```

---

## ChannelAnalyticsSection

### Header row

```
Динамика прироста          [Period ▾] [Metrics selector ▾]
```

- Period: ModelPicker with 5 options (desktop inside card; mobile in PageHeader)
- ChartSeriesSelector: toggle visible metric series

### Summary mini-metrics

Row of cards above chart:

- One card per visible series
- Label + value from `buildChannelSummaryCards()`

### MultiSeriesTrendChart

- Title: «Динамика прироста по метрикам канала»
- Interactive dots with growth badges
- Tooltip: primary value, % growth, range from start
- `compactAxisLabels` depends on period length

### Bottom row (2 cards)

| Card | Component |
|------|-----------|
| Прирост по метрикам | ChannelMetricBars |
| Реакции | ChannelReactionsPanel |

---

## ChannelMetricBars

Horizontal bars comparing metric growth for selected period.

Data from period index → seed analytics helpers.

---

## ChannelReactionsPanel

Breakdown of reaction types (emoji distribution) for channel.

---

## Periods

From `PLATFORM_ANALYTICS_PERIODS`:

| Index | Label |
|-------|-------|
| 0 | 24 часа |
| 1 | 7 дней |
| 2 | 30 дней |
| 3 | 90 дней |
| 4 | Всё время |

Mapped to chart granularity via `ANALYTICS_SCREEN_PERIOD_TO_CHART`.

---

## Metrics available in chart

Просмотры, подписчики, реакции, комментарии, репосты, ER — toggle via series selector.

---

## Related

- [charts](./charts.md)
- [AnalyticsHeatmap](../screens/analytics/) — screen-level heatmap component
