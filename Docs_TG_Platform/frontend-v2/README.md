# TG Platform — Frontend 2.0

Reference implementation web-клиента. Каноническая инженерная документация — [`../web/docs/engineering/stack.md`](../web/docs/engineering/stack.md).

Новая версия web-клиента TG Platform. Пишется **с нуля** по UI, но **инфраструктурная основа совпадает с v1** ([`../frontend/`](../frontend/)). [`../web-legacy/`](../web-legacy/) — только референс по UX.

## Quick start

```bash
cd Docs_TG_Platform/frontend-v2
npm ci
npm run dev
```

Откройте [http://localhost:3001](http://localhost:3001) (порт 3001, чтобы не конфликтовать с frontend v1 на 3000).

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

## Статус

**Фаза: Foundation parity + Shell**

Инфраструктура (как v1):

- MSW + Repository pattern + seed-data
- TanStack Query hooks в `entities/`
- `post-navigation-store`, полный `ui-store`
- Playwright E2E + CI

UI v2 (своя реализация):

- Sidebar, PageHeader, top-level screens (тела — заглушки)

Следующие шаги:

1. Home — Composer и глобальный ИИ-чат
2. Feed — секции ленты и карточки постов
3. Post workspace → GChat → Note

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — FSD, data flow
- [docs/BACKEND_READINESS.md](./docs/BACKEND_READINESS.md)
- [docs/API_CONTRACT.yaml](./docs/API_CONTRACT.yaml)
- Product spec: [`../web/docs/ux/pages.md`](../web/docs/ux/pages.md)

## Связь с другими клиентами

| Путь | Роль |
|------|------|
| `frontend/` | Production-клиент v1 |
| `frontend-v2/` | Новый клиент v2, активная разработка |
| `web-legacy/` | Архивный референс |
