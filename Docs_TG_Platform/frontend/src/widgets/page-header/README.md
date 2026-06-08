# widgets/page-header

Sticky glass header used on every screen. Three-column grid: left title/breadcrumb, center slot, right back + actions.

## Structure

```
page-header/
├── ui/
│   ├── PageHeader.tsx           # orchestrator
│   ├── page-header-left.tsx     # title + Breadcrumb
│   ├── page-header-center.tsx   # centered children (search, etc.)
│   ├── page-header-right.tsx    # BackButton + actions
│   ├── page-header-menu-button.tsx  # ⋯ context trigger
│   ├── post-mode-switch.tsx     # chat/chats/notes/comments toggle
│   └── post-jump-button.tsx     # stack navigation in post workspace
└── index.ts
```

## Center slot wiring

Pass `center` prop to `PageHeader`. Feed wires search + card width:

```tsx
<PageHeader
  title="Лента"
  center={<FeedSearchBar value={query} onChange={setQuery} />}
/>
```

`FeedSearchBar` (`widgets/feed`) composes `SearchField` + `FeedCardWidthToggle`.

## Public API

- `PageHeader` — main header
- `PageHeaderLeft`, `PageHeaderCenter`, `PageHeaderRight` — sub-slots (rarely imported directly)
- `PageHeaderMenuButton` — context menu trigger (post workspace)
- `PostModeSwitch`, `PostJumpButton` — post workspace controls

## Consumers

All screens under `screens/*` plus `widgets/post-workspace` (mode controls, context menu).
