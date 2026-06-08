# widgets/analytics-dashboard

Channel analytics overview: metrics, chart, top posts, rubric breakdown.

## Structure

```
analytics-dashboard/
├── AnalyticsDashboard.tsx      # period state + derived metrics
├── SimpleLineChart.tsx         # views line chart
├── ui/
│   ├── analytics-period-filter.tsx  # wraps FilterTabs
│   ├── top-posts-list.tsx
│   └── rubric-breakdown.tsx
└── index.ts
```

Data comes from `shared/data/analytics-seed` (mock) and published posts from `usePosts`. Rubric breakdown falls back to seed distribution when no posts have rubrics assigned.
