# Архитектура frontend (Feature-Sliced Design)

Production-клиент **TG Platform** организован по [Feature-Sliced Design](https://feature-sliced.design/). См. также [PRODUCT.md](./PRODUCT.md).

## Слои (сверху вниз)

```
app → screens → widgets → features → entities → shared
```

Импорт **только вниз** по слоям. Внутри слоя — предпочтительно через **public API** (`index.ts`).

| Слой | Путь | Ответственность |
|------|------|-----------------|
| **app** | `src/app/` | Next.js routing, providers, global store, styles |
| **screens** | `src/screens/` | Композиция экранов (1 URL ≈ 1 slice). *Не `pages/` — конфликт с Next.js Pages Router* |
| **widgets** | `src/widgets/` | Крупные UI-блоки (sidebar, composer, post workspace) |
| **features** | `src/features/` | Пользовательские сценарии (отправить, удалить, запланировать) |
| **entities** | `src/entities/` | Бизнес-сущности (post, chat, note, message) |
| **shared** | `src/shared/` | UI-kit, lib, config, types без домена |

## Сегменты slice

```
{slice}/
  ui/       — React-компоненты
  model/    — hooks, store, types slice
  lib/      — чистые функции
  api/      — запросы к backend (пока заглушки / local)
  config/   — константы slice
  index.ts  — public API
```

## Path aliases

```ts
@/app/*       → src/app/*
@/screens/*   → src/screens/*
@/widgets/*   → src/widgets/*
@/features/*  → src/features/*
@/entities/*  → src/entities/*
@/shared/*    → src/shared/*
@/*           → src/*  (корень src, для совместимости)
```

## Карта slices

### screens
`home`, `feed`, `post`, `note`, `notes`, `chats`, `gchat`, `analytics`, `profile`

### widgets
`app-shell`, `sidebar`, `page-header`, `composer`, `feed`, `post-workspace`, `chat-thread`, `charts`, `note-editor`, `profile-settings`, `analytics-dashboard`

### entities
`post`, `message` (+ `chat`, `note`, `user`, `channel` — по мере выделения)

### features
`post-context-menu`, `schedule-post`, `manage-drafts`, …

### shared/ui
`context-menu`, `model-picker`

## Next.js

- Маршруты: `src/app/(shell)/*/page.tsx` — thin wrapper, импорт из `@/screens/*`
- Providers: `src/app/(shell)/layout.tsx`
- Store: `src/app/model/store/`
- CSS: `src/app/styles/` (globals + screen styles)

## Правила

1. Не импортировать «вверх» по слоям.
2. Не импортировать внутренности slice — только `index.ts` (цель, постепенно).
3. `shared` не знает о `entities` / `features` / `widgets` / `screens`.
4. Utils без React — в `lib/`, не в `ui/`.

### ESLint (FSD boundaries)

- `npm run lint` — Next.js + **FSD boundaries** (error): слои app → screens → widgets → features → entities → shared; cross-slice импорты только через `index.ts`; нижние слои могут импортировать `@/app/model/store` (global store).
- `npm run lint:fsd-public-api:summary` — сводка нарушений public API (по target slice и файлам).

Конфиг: `eslint.config.mjs`.

## Public API (`index.ts`)

У каждого slice в `screens/`, `widgets/`, `features/`, `entities/` есть `index.ts`. Маршруты Next.js (`src/app/(shell)/*/page.tsx`) импортируют экраны только через `@/screens/{slice}`.

## Миграция

Скрипты: `scripts/fsd_migrate.py`, `scripts/fsd_fix_imports.py` (исторические, уже выполнены).
