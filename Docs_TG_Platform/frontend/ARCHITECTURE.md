# Архитектура frontend (Feature-Sliced Design)

Production-клиент **TG Platform** организован по [Feature-Sliced Design](https://feature-sliced.design/).

## Слои (сверху вниз)

```
app → screens → widgets → features → entities → shared
```

Импорт **только вниз** по слоям. Внутри слоя — через **public API** (`index.ts`).

| Слой | Путь | Ответственность |
|------|------|-----------------|
| **app** | `src/app/` | Next.js routing, providers, Zustand stores |
| **screens** | `src/screens/` | Композиция экранов (1 URL ≈ 1 slice) |
| **widgets** | `src/widgets/` | Крупные UI-блоки (sidebar, composer, feed) |
| **features** | `src/features/` | Пользовательские сценарии |
| **entities** | `src/entities/` | Бизнес-сущности (post, chat, note) |
| **shared** | `src/shared/` | UI-kit, lib, API, types, seed data |

## Data flow

```
UI (feature/widget/screen)
  → TanStack Query hook (entities/*/model)
    → Repository interface (shared/api/repositories.ts)
      → MSW handlers (dev) | HTTP client (prod)
        → In-memory seed store
```

Переключение режима — через `shared/config/dataSource.ts` (см. [docs/BACKEND_READINESS.md](./docs/BACKEND_READINESS.md)).

## State

| Concern | Tool | Location |
|---------|------|----------|
| Server data | TanStack Query | `entities/*/model/use*.ts` |
| UI chrome | Zustand | `app/model/store/ui-store.ts` |
| Post navigation stack | Zustand | `app/model/store/post-navigation-store.ts` |
| Theme | next-themes | `app/providers/AppProviders.tsx` |

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

- Маршруты: `src/app/(shell)/*/page.tsx` — thin wrappers → `@/screens/*`
- Static export в production (`next.config.ts`)
- `generateStaticParams` для dynamic routes (seed IDs)

## Testing & CI

```bash
npm run check   # full pipeline
```

GitHub Actions: `.github/workflows/frontend-ci.yml`

## ESLint (FSD boundaries)

`eslint.config.mjs` — `eslint-plugin-boundaries` enforces layer imports.
