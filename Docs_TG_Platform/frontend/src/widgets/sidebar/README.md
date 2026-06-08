# widgets/sidebar

Primary navigation rail with recent notes/chats and feed post context.

## Structure

```
sidebar/
├── Sidebar.tsx              # thin orchestrator (~85 lines)
├── model/
│   ├── useSidebar.ts
│   └── types.ts
├── lib/
│   ├── buildRecentModels.ts
│   ├── buildSidebarRecentSections.ts
│   └── mapRecentRows.ts
├── ui/
│   ├── sidebar-header.tsx
│   ├── sidebar-brand.tsx
│   ├── sidebar-collapse-button.tsx
│   ├── sidebar-expandable-nav.tsx
│   ├── sidebar-feed-post-row.tsx
│   ├── sidebar-recent-row.tsx
│   ├── SidebarRecentList.tsx
│   ├── sidebar-nav.tsx
│   ├── SidebarNavItem.tsx
│   └── nav-icons.tsx
└── index.ts                 # exports Sidebar only
```

## Behavior

- Collapsible rail on viewports ≥761px (`RAIL_MIN_MQ`)
- Expandable sections for recent notes and chats
- Feed post sub-row when viewing a post or post-scoped note
- Grouped recent lists on post screens (`Этот пост` / `Остальные`)
