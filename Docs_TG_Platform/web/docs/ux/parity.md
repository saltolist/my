# UI parity tracker

Reference UI = [`web-legacy`](../../../web-legacy/) — **полный эталон**. Spec = [pages.md](./pages.md).

Новая версия — [`web/src/`](../../src/) — воспроизводит legacy 1:1 на v2-стеке. План фаз — [08-roadmap.md](../product/08-roadmap.md). **Gate checklist M3–M5:** [m3-m5-gate-checklist.md](../engineering/m3-m5-gate-checklist.md). Карта экранов → код — [08-roadmap § Карта экранов](../product/08-roadmap.md#карта-экранов--код).

## Implementation progress

| Phase | Scope | Status |
|-------|-------|--------|
| M1 Foundation | data layer, CI, all routes | ✅ |
| M2 Shell | sidebar, PageHeader, RouteSync, ContentAdaptSync | ✅ |
| M3 Widgets | composer, feed, post-workspace, … | 🟡 ~85% |
| M4 Features + screens | features slices + 9 screen parity | 🟡 ~85% — 4/9 done |
| M5 Local-first | full demo CRUD + user scenario | 🔴 |
| M6 GitHub Pages | deploy workflow | 🔴 |
| M7 Backend gate | http mode verified | 🔴 |

Backend-only limits (stub AI, in-memory) — [local-first.md](../engineering/local-first.md). Снимаются на **Track B** после M7.

---

## Screen parity

| Screen | URL | Spec | Reference UI | web | Gaps до `done` |
|--------|-----|------|--------------|-----|----------------|
| Home | `/` | [pages.md §1](./pages.md#1-home) | done | 🟡 partial | attach / `@` mention E2E |
| GChat | `/gchat/?id=` | [pages.md §2](./pages.md#2-gchat) | done | 🟡 partial | delete, message edit E2E |
| Feed | `/feed/` | [pages.md §3](./pages.md#3-feed) | done | done | — |
| Post | `/post/{id}/` | [pages.md §4](./pages.md#4-post) | done | done | — |
| Note | `/note/*` | [pages.md §5](./pages.md#5-note) | done | 🟡 partial | edit, DnD, dirty E2E |
| Chats | `/chats/` | [pages.md §6](./pages.md#6-chats) | done | done | — |
| Notes | `/notes/` | [pages.md §7](./pages.md#7-notes) | done | done | AI filter interaction E2E (minor) |
| Analytics | `/analytics/` | [pages.md §8](./pages.md#8-analytics) | done | 🟡 partial | period switch E2E |
| Profile | `/profile/` | [pages.md §9](./pages.md#9-profile) | done | 🟡 partial | tabs/dirty E2E; alert→modal polish |

Wireframes: [wireframes/](./wireframes/). Components: [components/](./components/).

**Код:** все экраны — реальные screen components в [`screens/`](../../src/screens/), не route-level placeholders.

---

## Spec gaps (docs vs legacy — closed)

| Gap | Status | Notes |
|-----|--------|-------|
| Feed post width controls | closed | feed-header-toolbar (legacy buttons + PageHeaderSelect) |
| MultiReplyToggle | closed | composer |
| PageHeader center search | closed | feed, chats, notes |
| Post comments row on feed card | closed | PostCommentsRow |
| Note embed DnD | closed | note-editor widget |
| Glass PageHeader | closed | see [design-tokens.md](./design-tokens.md) |

### Open code notes

| Item | Status | Notes |
|------|--------|-------|
| `widgets/analytics/ui/analytics-period-filter.tsx` | orphan | не импортируется; period в `ChannelAnalyticsSection` / `PageHeaderSelect` |

---

## Backend phase (not UX parity)

| Limit | Doc | Milestone |
|-------|-----|-----------|
| Stub AI, no real LLM | [local-first.md](../engineering/local-first.md) | M5 / Track B |
| No persistence on reload | [local-first.md](../engineering/local-first.md) | M5 / Track B |
| No auth / multi-user | [08-roadmap.md](../product/08-roadmap.md) Track B | future |

---

## E2E coverage

Source: [`e2e/shell.spec.ts`](../../e2e/shell.spec.ts) (17 tests). Details: [testing.md](../engineering/testing.md).

| Area | Covered | Notes |
|------|---------|-------|
| Home load | yes | |
| Home send → gchat | yes | composer → new global chat |
| Sidebar → feed | yes | sections «Опубликованные», «Черновики» |
| Sidebar → notes | yes | filter «Все», «Новая заметка» |
| Chats → back | yes | |
| Chats scope select | yes | Все → Глобальные |
| GChat load + back | yes | |
| GChat legacy redirect | yes | `/gchat/gc1/` → `?id=gc1` |
| Analytics load | yes | heading + period UI |
| Post load | yes | breadcrumbs, card, composer |
| Post legacy redirect | yes | `/post/5/notes/` → `/post/5/` |
| Global note load | yes | title from seed |
| Feed open post | yes | click card → post chat |
| Feed create draft | yes | composer ↑ |
| Post modes / edit / menu | yes | Заметки/Чаты, inline edit, publish draft |
| Note edit / DnD / dirty | planned | |
| GChat delete | planned | |
| Profile tabs / dirty | planned | |

---

## Related

- [flows.md](./flows.md)
- [web-client.md](../engineering/web-client.md)
- [doc-maintenance.md](../doc-maintenance.md)
