# UI parity tracker

Reference UI = [`web-legacy`](../../../web-legacy/) — **полный эталон**. Spec = [pages.md](./pages.md).

Новая версия — [`frontend-v2`](../../../frontend-v2/) — воспроизводит legacy 1:1 на v2-стеке. План фаз — [08-roadmap.md](../product/08-roadmap.md).

## Implementation progress

| Phase | Scope | Status |
|-------|-------|--------|
| M1 Foundation | data layer, CI, 6 top-level routes | 🟡 in progress |
| M2 Shell | sidebar, PageHeader, RouteSync | 🔴 |
| M3 Widgets | composer, feed, post-workspace, … | 🔴 |
| M5 Screens | 9 screens parity | 🔴 |
| M6 GitHub Pages | deploy workflow | 🔴 |

Backend-only limits (stub AI, in-memory) — [local-first.md](../engineering/local-first.md). Снимаются на **Track B** после M7.

---

## Screen parity

| Screen | URL | Spec | Reference UI | frontend-v2 |
|--------|-----|------|--------------|-------------|
| Home | `/` | [pages.md §1](./pages.md#1-home) | done | 🟡 shell |
| GChat | `/gchat/?id=` | [pages.md §2](./pages.md#2-gchat) | done | 🔴 no route |
| Feed | `/feed/` | [pages.md §3](./pages.md#3-feed) | done | 🟡 shell |
| Post | `/post/{id}/` | [pages.md §4](./pages.md#4-post) | done | 🔴 no route |
| Note | `/note/*` | [pages.md §5](./pages.md#5-note) | done | 🔴 no route |
| Chats | `/chats/` | [pages.md §6](./pages.md#6-chats) | done | 🟡 shell |
| Notes | `/notes/` | [pages.md §7](./pages.md#7-notes) | done | 🟡 shell |
| Analytics | `/analytics/` | [pages.md §8](./pages.md#8-analytics) | done | 🟡 shell |
| Profile | `/profile/` | [pages.md §9](./pages.md#9-profile) | done | 🟡 shell |

Wireframes: [wireframes/](./wireframes/). Components: [components/](./components/).

---

## Spec gaps (docs vs legacy — closed)

| Gap | Status | Notes |
|-----|--------|-------|
| FeedCardWidthToggle | closed | feed screen |
| MultiReplyToggle | closed | composer |
| PageHeader center search | closed | feed, chats, notes |
| Post comments row on feed card | closed | PostCommentsRow |
| Note embed DnD | closed | note-editor widget |
| Glass PageHeader | closed | see [design-tokens.md](./design-tokens.md) |

---

## Backend phase (not UX parity)

| Limit | Doc | Milestone |
|-------|-----|-----------|
| Stub AI, no real LLM | [local-first.md](../engineering/local-first.md) | M5 demo / Track B |
| No persistence on reload | [local-first.md](../engineering/local-first.md) | M5 / Track B |
| No auth / multi-user | [08-roadmap.md](../product/08-roadmap.md) Track B | future |

---

## E2E coverage

| Area | Covered | Doc |
|------|---------|-----|
| Home load | yes | [testing.md](../engineering/testing.md) |
| Sidebar → feed | yes | |
| Sidebar → notes | yes | |
| Chats → back | yes | |
| Post, note, analytics, profile | planned | |

---

## Related

- [flows.md](./flows.md)
- [web-client.md](../engineering/web-client.md)
- [doc-maintenance.md](../doc-maintenance.md)
