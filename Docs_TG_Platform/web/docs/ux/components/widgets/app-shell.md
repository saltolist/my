# app-shell

**Путь:** `web/src/widgets/app-shell/`

Корневой layout приложения.

---

## AppShell anatomy

```
┌──────────┬──────────────────────────────┐
│ Sidebar  │ main content area            │
│          │  PageHeader (per screen)     │
│          │  {children} = screen routes  │
└──────────┴──────────────────────────────┘
     ↳ overlay backdrop when mobile sidebar open
     ↳ menu button in PageHeader (mobile), not separate topbar
```

---

## Components

| Component | Role |
|-----------|------|
| **AppShell** | Layout shell, sidebar + content |
| **RouteSync** | URL ↔ `navigation-store` + legacy redirects |
| **ContentAdaptSync** | `--content-adapt-w`, `data-content-adapt-*`, profile AI tiers |

---

## Mobile behavior

- `PageHeaderMenuButton` in screen header → opens sidebar overlay
- Sidebar slides over content (`#sidebar` fixed, `body.mobile-sidebar-open`)
- Click backdrop / navigate / Escape → closes sheet
- `setMobileSidebarOpen` in `ui-store`

---

## RouteSync

- Parses pathname via `shared/lib/routes.ts`
- Legacy redirects: `/gchat/{id}/` → `/gchat/?id=`, `/post/{id}/notes/` → post + `postMode`
- `buildRoutePatch` with TanStack Query cache (posts, globalNotes, globalChats)
- Updates `navigation-store` and `post-navigation-store`

**Out of scope (M3+):** domain store, dirty guards, `processCombinedPatch`

---

## ContentAdaptSync

- `syncContentAdaptWidthToDocument()` on resize and mobile breakpoint
- Sets `data-shell-overlay`, `data-content-adapt-ge-761`, profile `data-profile-ai-*`

---

## Content area

- Scroll containers live inside screens (`screen-body`), not shell
- PageHeader fixed per screen
- Shell provides min-height / flex layout

---

## Related

- [sidebar](./sidebar.md)
- [page-header](./page-header.md)
- [screens.md](../screens.md)
