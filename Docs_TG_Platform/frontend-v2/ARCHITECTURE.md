# Архитектура Frontend 2.0

## Принципы

1. **С нуля** — не переносим файлы из `frontend/` или `web-legacy/`; смотрим на референс и проектируем заново.
2. **Тот же стек** — Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, TanStack Query, Zustand.
3. **FSD** — Feature-Sliced Design, импорт только вниз по слоям.
4. **Страница за страницей** — каждый экран доводим до готовности, прежде чем тащить следующий.

## Слои

```
app → screens → widgets → features → entities → shared
```

| Слой | Путь | Ответственность |
|------|------|-----------------|
| **app** | `src/app/` | Routing, providers, Zustand UI store |
| **screens** | `src/screens/` | Композиция экрана (1 URL ≈ 1 slice) |
| **widgets** | `src/widgets/` | Крупные блоки (shell, sidebar, feed, …) |
| **features** | `src/features/` | Пользовательские сценарии |
| **entities** | `src/entities/` | Доменные сущности |
| **shared** | `src/shared/` | UI-kit, lib, types, config |

## Shell (текущая фаза)

Уже есть:

- `AppProviders` — theme + React Query + TooltipProvider
- `AppShell` — desktop sidebar + mobile drawer
- `Sidebar` — rail collapse, nav по [10-pages.md](../concept/10-pages.md), недавние списки
- `PageHeader` — glass header, left/center/right slots
- Все top-level screens с шапками (тела — `EmptyState` заглушки)
- `shared/data/preview-seed.ts` — mock для sidebar recents
- `ui-store` — sidebar collapse, mobile drawer, feed card width, theme

Пока **нет**: MSW, repositories, entities, Composer, контент экранов.

## Дизайн v2 vs референс

Из `web-legacy` берём **идеи**, не CSS:

- боковая навигация с недавними;
- glass header;
- ширины карточек ленты;
- composer внизу / по центру на главной.

В v2 — свои токены в `globals.css` (oklch, `--shell-*`, `.glass-surface`), shadcn base-nova.

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

## Порядок разработки экранов

Рекомендуемая очередь (см. [10-pages.md](../concept/10-pages.md)):

1. Home + Composer
2. Feed
3. Post workspace
4. Chats / GChat
5. Notes
6. Analytics
7. Profile

На каждом шаге: widget → screen → route → (позже) entity + feature + data.
