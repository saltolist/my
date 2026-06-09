# UI parity tracker

Reference UI = [`web-legacy`](../../../web-legacy/) — **полный эталон**. Spec = [pages.md](./pages.md).

Новая версия должна воспроизвести legacy 1:1 на v2-стеке. Backend-only ограничения (stub AI, in-memory) — [local-first.md](../engineering/local-first.md), [08-roadmap.md](../product/08-roadmap.md).

---

## Screen parity

| Screen | URL | Spec | Reference UI |
|--------|-----|------|--------------|
| Home | `/` | [pages.md §1](./pages.md#1-home) | done |
| GChat | `/gchat/?id=` | [pages.md §2](./pages.md#2-gchat) | done |
| Feed | `/feed/` | [pages.md §3](./pages.md#3-feed) | done |
| Post | `/post/{id}/` | [pages.md §4](./pages.md#4-post) | done |
| Note | `/note/*` | [pages.md §5](./pages.md#5-note) | done |
| Chats | `/chats/` | [pages.md §6](./pages.md#6-chats) | done |
| Notes | `/notes/` | [pages.md §7](./pages.md#7-notes) | done |
| Analytics | `/analytics/` | [pages.md §8](./pages.md#8-analytics) | done |
| Profile | `/profile/` | [pages.md §9](./pages.md#9-profile) | done |

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

| Limit | Doc | Phase |
|-------|-----|-------|
| Stub AI, no real LLM | [local-first.md](../engineering/local-first.md) | roadmap 2–4 |
| No persistence on reload | [local-first.md](../engineering/local-first.md) | roadmap 2 |
| No auth / multi-user | [08-roadmap.md](../product/08-roadmap.md) | roadmap 6+ |

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
