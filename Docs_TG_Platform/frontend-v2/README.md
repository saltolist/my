# TG Platform — Frontend 2.0

Reference implementation web-клиента. Каноническая инженерная документация — [`../web/docs/engineering/stack.md`](../web/docs/engineering/stack.md).

**Roadmap:** [`../web/docs/product/08-roadmap.md`](../web/docs/product/08-roadmap.md) · кратко: [`../web/docs/engineering/frontend-roadmap.md`](../web/docs/engineering/frontend-roadmap.md)

[`../web-legacy/`](../web-legacy/) — UX reference (read-only). [`../frontend/`](../frontend/) — v1 production client.

## Quick start

```bash
cd Docs_TG_Platform/frontend-v2
npm ci
npm run dev
```

Откройте [http://localhost:3001](http://localhost:3001).

## Environment

См. [`.env.example`](.env.example):

- `NEXT_PUBLIC_USE_MSW=1` — MSW mock API (default в dev)
- `NEXT_PUBLIC_USE_MSW=0` + `NEXT_PUBLIC_API_BASE_URL` — real backend
- `NEXT_PUBLIC_BASE_PATH` — GitHub Pages base path

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (MSW включён по умолчанию) |
| `npm run build` | Static export → `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint + FSD boundaries |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run check` | typecheck + lint + test + build |

## Статус — M1 Foundation

| Готово | В работе / дальше |
|--------|-------------------|
| MSW + Repository + seed | Маршруты gchat, post, note |
| TanStack Query entities | RouteSync, legacy redirects |
| Sidebar, PageHeader, AppShell (partial) | Widgets: composer, feed, post-workspace… |
| CI check job | GitHub Pages deploy (M6) |
| 4 E2E smoke tests | E2E per screen (M5) |

**Следующий шаг (roadmap Фаза 1):** все URL из [routing.md](../web/docs/engineering/routing.md) + placeholder screens.

Затем **Фаза 2** shell → **Фаза 3** widgets → **Фаза 5** экраны по [pages.md](../web/docs/ux/pages.md).

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — FSD, data flow
- [docs/BACKEND_READINESS.md](./docs/BACKEND_READINESS.md)
- [docs/API_CONTRACT.yaml](./docs/API_CONTRACT.yaml)
- UX spec: [`../web/docs/ux/pages.md`](../web/docs/ux/pages.md)
- Parity tracker: [`../web/docs/ux/parity.md`](../web/docs/ux/parity.md)

## Связь с другими клиентами

| Путь | Роль |
|------|------|
| `frontend/` | Production-клиент v1 |
| `frontend-v2/` | **Active v2 client** |
| `web-legacy/` | UX reference |
