# Архитектура Frontend 2.0

## Принципы

1. **UI с нуля** — виджеты и экраны проектируем заново, не копируем из `frontend/` или `web-legacy/`.
2. **Основа как v1** — data layer, types, stores, tooling совпадают с [`../frontend/`](../frontend/).
3. **FSD** — Feature-Sliced Design, импорт только вниз по слоям.
4. **Страница за страницей** — каждый экран доводим до готовности, прежде чем тащить следующий.

## Слои

```
app → screens → widgets → features → entities → shared
```

| Слой | Путь | Ответственность |
|------|------|-----------------|
| **app** | `src/app/` | Routing, providers, Zustand stores |
| **screens** | `src/screens/` | Композиция экрана (1 URL ≈ 1 slice) |
| **widgets** | `src/widgets/` | Крупные UI-блоки (shell, sidebar, feed, …) |
| **features** | `src/features/` | Пользовательские сценарии |
| **entities** | `src/entities/` | Доменные сущности + React Query hooks |
| **shared** | `src/shared/` | UI-kit, lib, API, types, seed data |

## Data flow

```
UI (screen/widget)
  → TanStack Query hook (entities/*/model)
    → Repository interface (shared/api/repositories.ts)
      → MSW handlers (dev) | HTTP client (prod)
        → In-memory seed store
```

Переключение режима — через `shared/config/dataSource.ts` (см. [docs/BACKEND_READINESS.md](./docs/BACKEND_READINESS.md)).

## Providers (порядок как v1)

```
MswProvider → ThemeProvider → QueryProvider → RepositoryProvider → TooltipProvider
```

## State

| Concern | Tool | Location |
|---------|------|----------|
| Server data | TanStack Query | `entities/*/model/use*.ts` |
| UI chrome | Zustand | `app/model/store/ui-store.ts` |
| Post navigation stack | Zustand | `app/model/store/post-navigation-store.ts` |
| Theme | next-themes | `AppProviders` |

## Что есть сейчас

**Foundation (parity v1):**

- `shared/api/` — repositories, MSW, zod schemas, http client
- `shared/data/seed-data.ts` — полный seed домена
- `entities/` — post, chat, note, channel hooks
- `shared/lib/routes.ts` — полный парсинг URL
- Playwright E2E + GitHub Actions CI

**UI v2:**

- `AppShell`, `Sidebar` (live recents из Repository), `PageHeader`
- Top-level screens: home, feed, chats, notes, analytics, profile

**Пока нет:** features, Composer, FeedWidget, PostWorkspace, NoteEditor, маршруты post/gchat/note.

→ Полный план: [`../web/docs/product/08-roadmap.md`](../web/docs/product/08-roadmap.md)

## Path aliases

```ts
@/app/*       → src/app/*
@/screens/*   → src/screens/*
@/widgets/*   → src/widgets/*
@/features/*  → src/features/*
@/entities/*  → src/entities/*
@/shared/*    → src/shared/*
```

## Next.js

- Маршруты: `src/app/(shell)/*/page.tsx` → thin wrapper → `@/screens/*`
- Static export в production (`next.config.ts`)
- `trailingSlash: true`
- Dev port: **3001** (v1 = 3000)

## Порядок разработки экранов

1. Home + Composer
2. Feed
3. Post workspace
4. Chats / GChat
5. Notes
6. Analytics (dashboard)
7. Profile (settings)
