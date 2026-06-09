# app-shell

**Путь:** `web-legacy/src/widgets/app-shell/`

Корневой layout приложения.

---

## AppShell anatomy

```
┌─────────────────────────────────────────┐
│ MobileTopbar (mobile only)              │
├──────────┬──────────────────────────────┤
│ Sidebar  │ main content area            │
│          │  {children} = screen routes  │
│          │                              │
└──────────┴──────────────────────────────┘
     ↳ sheet overlay when mobile sidebar open
```

---

## Components

| Component | Role |
|-----------|------|
| **AppShell** | Layout shell, sidebar + content |
| **RouteSync** | URL ↔ navigation store sync on route change |
| **ContentAdaptSync** | CSS vars / classes for content width adaptation |

---

## Mobile behavior

- Topbar with menu button → opens sidebar sheet
- Sidebar slides over content
- Click outside / navigate → closes sheet
- `setMobileSidebarOpen` in navigation store

---

## RouteSync

- Parses pathname via `shared/lib/routes.ts`
- Updates `screen`, post id, chat id, note ids in nav store
- Handles static export path trailing slashes

---

## Content area

- Scroll containers live inside screens, not shell
- PageHeader fixed per screen
- Shell provides min-height / flex layout

---

## Related

- [sidebar](./sidebar.md)
- [screens.md](../screens.md)
