# widgets/app-shell

Application chrome: sidebar rail, mobile sheet, and top bar.

## Structure

```
app-shell/
├── ui/
│   ├── AppShell.tsx      # layout orchestrator
│   └── MobileTopbar.tsx  # hamburger + screen title (≤760px)
└── index.ts
```

## Behavior

- Desktop (≥761px): persistent `Sidebar` rail
- Mobile: `Sheet` slide-over sidebar + `MobileTopbar`
- Sets `document.body.dataset.screen` from current route
- Escape closes mobile sidebar

## Consumers

- `app/(shell)/layout.tsx` — wraps all product screens

## Dependencies

- **widgets**: `sidebar`
- **shared**: `sheet`, `routes` config
- **app**: `ui-store` (`mobileSidebarOpen`)
