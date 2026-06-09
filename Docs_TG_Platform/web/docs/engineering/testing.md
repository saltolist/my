# Testing

Strategy for web client. Reference CI: [`.github/workflows/frontend-v2-ci.yml`](../../../../.github/workflows/frontend-v2-ci.yml).

Stack tools — [stack.md](./stack.md).

---

## Pyramid

```
        E2E (Playwright)     ← critical paths
       /                  \
  Component (RTL)          ← future, isolated widgets
 /                          \
Unit (Vitest)                ← lib, schemas, repositories
```

---

## Unit tests (Vitest)

**Location:** `*.test.ts` next to source in `frontend-v2/src/`.

**Current coverage examples:**

- `shared/lib/lib.test.ts` — routes, stub AI replies
- `shared/api/seedRepositories.test.ts` — repository CRUD

**Run:** `npm run test`

**Targets:**

- `shared/lib/routes.ts` — parseAppPath, getParentPath, legacy redirects
- `shared/api/schemas/` — Zod parse valid/invalid payloads
- `shared/lib/replies.ts` — keyword matching
- Repository implementations vs [API_CONTRACT.yaml](./API_CONTRACT.yaml)

---

## E2E tests (Playwright)

**Location:** `frontend-v2/e2e/`

**Config:** `playwright.config.ts` — Chromium, dev server on port 3001.

### Implemented (`shell.spec.ts`)

| Test | Path |
|------|------|
| Home loads | `/` → «Чем помочь сегодня?» |
| Navigate feed from sidebar | `/` → Лента heading |
| Chats back to home | `/chats/` → Назад → home |
| Navigate notes from sidebar | `/` → Заметки heading |

**Run:** `npm run test:e2e`

### Planned per screen

| Screen | Scenarios |
|--------|-----------|
| home | Send message → gchat |
| feed | Open post, draft DnD, search |
| post | Mode tabs, context menu, inline edit |
| gchat | Thread, delete chat |
| note | Edit, dirty guard, embed DnD |
| chats | Scope filter, open chat |
| notes | AI filter, new note |
| analytics | Period switch |
| profile | Tab switch, dirty guard |

---

## Definition of Done (per screen)

- [ ] Matches [pages.md](../ux/pages.md) and wireframe
- [ ] Seed data loads without errors
- [ ] `← Назад` follows [routing.md](./routing.md)
- [ ] No console errors on happy path
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` static export succeeds
- [ ] E2E smoke test added or updated

Tracker: [parity.md](../ux/parity.md)

---

## MSW contract tests

Handlers in `shared/api/msw/handlers.ts` must match:

- [API_CONTRACT.yaml](./API_CONTRACT.yaml) paths and methods
- [api-schemas.md](./api-schemas.md) request/response shapes

When adding endpoint: update YAML → handlers → api-schemas → BACKEND_READINESS checklist.

---

## CI pipeline

**Trigger:** changes under `Docs_TG_Platform/frontend-v2/**`

**Steps (Node 22):**

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npx playwright install chromium --with-deps`
6. `npm run test:e2e`
7. `npm run build` (with `NEXT_PUBLIC_BASE_PATH` for GH Pages)

**Note:** Documentation-only changes in `web/docs/` do not trigger this workflow.

---

## Related

- [local-first.md](./local-first.md)
- [deploy.md](./deploy.md)
