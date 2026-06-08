# widgets/feed

Feed list with published, scheduled, and draft post sections.

## Structure

```
feed/
├── FeedWidget.tsx          # data + drag-reorder orchestrator
├── ui/
│   ├── feed-section.tsx    # section header + empty state
│   └── feed-search-bar.tsx # search input (used by FeedScreen)
└── index.ts
```

## Sections

| Section | Drag reorder | Comments link |
|---------|--------------|---------------|
| Опубликованные | no | yes |
| Отложенные | no | no |
| Черновики | yes | no |

Draft reorder uses `features/reorder-drafts`.
