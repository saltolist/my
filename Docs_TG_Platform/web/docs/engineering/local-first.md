# Local-first mode

Phase 1 client behavior: in-memory data, MSW mock API, stub AI. Limits — [web-client.md](./web-client.md).

Data model — [data-model.md](./data-model.md). API — [api-schemas.md](./api-schemas.md).

---

## Data source modes

From [`web/src/shared/config/dataSource.ts`](../../src/shared/config/dataSource.ts):

| Mode | Condition | Behavior |
|------|-----------|----------|
| `msw` | default in dev (`NEXT_PUBLIC_USE_MSW` not `0`) | HTTP repos; MSW intercepts `/api/v1/*` |
| `seed` | `USE_MSW=0`, no API URL | Direct in-memory repositories (tests) |
| `http` | `USE_MSW=0` + `NEXT_PUBLIC_API_BASE_URL` | Real backend |

```bash
# MSW (default dev)
NEXT_PUBLIC_USE_MSW=1

# Real API
NEXT_PUBLIC_USE_MSW=0
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

---

## Seed inventory

Source: [`web/src/shared/data/seed-data.ts`](../../src/shared/data/seed-data.ts)

### Posts (5 total)

| id | status | Notes |
|----|--------|-------|
| 1 | published | Media, 3 local notes, 1 local chat, 6 comments |
| 2 | published | 2 media, 4 comments |
| 5 | published | Text only |
| 3 | scheduled | Media, date «5 мая · 19:00» |
| 4 | draft | created «1 мая» |

**Pinned post ids:** `[1, 2]`

### Global chats (2)

| id | title |
|----|-------|
| gc1 | Анализ недели |
| gc2 | Контент-план на май |

### Global notes (4)

| id | title | ai |
|----|-------|-----|
| gn1 | Структура серии про барьеры инвестора | true |
| gn2 | Мониторинг конкурентов | false |
| gn3 | Правила канала (расширенные) | true |
| gn4 | Идеи постов на май | false |

### Profile presets

- **Channel:** «Деньги без паники» — 4 rubrics, full core/voice/rules
- **AI:** 4 LLM, 3 web search, orchestrator/reasoner models, demo API keys
- **Telegram:** connected channel `@dengibeznpaniki`, 128 imported posts; bot idle

### Analytics seed

[`analytics-seed.ts`](../../src/shared/data/analytics-seed.ts): **110 days** of `ChannelDayMetrics`, platform model usage stats for profile tab.

---

## Stub AI rules

Provider: [`shared/lib/ai/index.ts`](../../src/shared/lib/ai/index.ts) → `createStubAiProvider()`.

Keywords: [`shared/lib/replies.ts`](../../src/shared/lib/replies.ts).

### Global scope (`home`, `gchat`)

| Keyword in message | Response theme |
|--------------------|----------------|
| `контент-план` | Weekly content plan |
| `рубрик` | Rubric performance stats |
| `тем` | 5 post ideas |
| `охват` | Reach drop analysis |
| *(fallback)* | Ask for more context |

MSW `POST /global-chats/{id}/messages` uses `getGlobalReply(text)`.

### Post scope (`post` chat)

| Keyword | Response theme |
|---------|----------------|
| `перепиш`, `rewrite` | Rewritten intro |
| `заголов` | Title variants |
| `почему`, `аналити` | Why post performed |
| *(fallback)* | Ask what to improve |

### After user message edit

Fixed placeholder: `STUB_REPLY_AFTER_USER_EDIT` in [`chatPaths.ts`](../../src/shared/lib/chatPaths.ts) — multi-paragraph typography stub ending with «отредактировано».

---

## Persistence

| Data | Survives reload? |
|------|------------------|
| Posts, notes, chats, profile edits | **No** (MSW in-memory store resets) |
| Theme (`light` / `system` / `dark`) | **Yes** — localStorage |
| Sidebar collapsed | **Yes** — `tg-platform-sidebar-collapsed` |
| Feed card width | Session / Zustand (until reload) |
| Draft reorder (feed DnD) | **No** |
| Post navigation mode/stack | **No** |

---

## Explicit limits

- No real Telegram publish
- No real LLM / SSE
- No prod auth or multi-user
- No cross-tab sync

→ Backend phase: [BACKEND_READINESS.md](./BACKEND_READINESS.md), [08-roadmap.md](../product/08-roadmap.md)

---

## Related

- [testing.md](./testing.md) — MSW mode in e2e
- [deploy.md](./deploy.md) — MSW off in production builds
