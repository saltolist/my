# Roadmap — идеальный фронтенд

План доводит web-клиент до состояния: **UX = `web-legacy` 1:1**, **стек = `frontend-v2`**, **local-first demo на GitHub Pages**, **подключение backend одной сменой env**.

Код: [`web/src/`](../../src/). Спека экранов: [pages.md](../ux/pages.md). Parity-трекер: [parity.md](../ux/parity.md). Reference scaffold: [`frontend-v2/`](../../../frontend-v2/).

---

## Результат (Definition of Done проекта)

| Критерий | Проверка |
|---|---|
| Все 9 экранов из [pages.md](../ux/pages.md) | [parity.md](../ux/parity.md) — каждый `done` |
| FSD без нарушений границ | `npm run lint` (eslint-plugin-boundaries) |
| Local-first demo | MSW + seed, stub AI, полный CRUD в памяти |
| Статический билд | `npm run build` → `out/` |
| CI зелёный | `npm run check` в [web-ci.yml](../../../../.github/workflows/web-ci.yml) |
| GitHub Pages | публичный URL, `NEXT_PUBLIC_BASE_PATH` корректен |
| Backend-ready | `NEXT_PUBLIC_USE_MSW=0` + `NEXT_PUBLIC_API_BASE_URL` — те же экраны работают |
| Контракт API | handlers MSW = [API_CONTRACT.yaml](../engineering/API_CONTRACT.yaml) |

**Не входит во фронтенд-roadmap:** реальный Telegram, LLM, persistence на сервере, auth — [Track B](#track-b--backend-после-фронтенда).

**Gate перед GitHub Pages (M6):** [m3-m5-gate-checklist.md](../engineering/m3-m5-gate-checklist.md) — закрыть M3–M5 + polish.

---

## Текущее состояние

*Обновлено по аудиту `web/src/` (июнь 2026). Детали экранов — [parity.md](../ux/parity.md).*

| Слой | Статус | Как реализовано |
|---|---|---|
| Документация (`web/docs/`) | ✅ complete | product + ux + engineering |
| Data layer (`shared/api`, MSW, seed) | ✅ ~95% | [`shared/api/`](../../src/shared/api/) — repositories, MSW handlers, seed, zod schemas |
| Entities (TanStack Query) | ✅ | `entities/post`, `chat`, `note`, `message`, `user` + query hooks |
| App shell | ✅ M2 | [`widgets/app-shell`](../../src/widgets/app-shell/), `sidebar`, `page-header`, `RouteSync`, `ContentAdaptSync` |
| Маршруты Next.js | ✅ 13 pages | [`app/(shell)/`](../../src/app/(shell)/) — все 9 экранов + `/note/new/`, post-note route, legacy redirect stubs |
| Widgets | 🟡 ~85% | Все 9 spec-widgets + shell; см. [карту слоёв](#карта-слоёв-fsd) |
| Features | 🟡 ~50% | 8 срезов в [`features/`](../../src/features/); 6 сценариев Phase 4 ещё в widgets/store |
| Screens (9) | 🟡 ~75% | [`screens/`](../../src/screens/) — полная композиция; chats + notes ближе к `done` |
| E2E | 🟡 12 smoke | [`e2e/shell.spec.ts`](../../e2e/shell.spec.ts) — load + nav + post/note; deep interactions planned |
| GitHub Pages deploy | 🔴 | Только [web-ci.yml](../../../../.github/workflows/web-ci.yml) check, без deploy job |

---

## Принципы реализации

1. **UX = legacy 1:1** — не добавляем UI, которого нет в `web-legacy`.
2. **Сначала полки, потом экраны** — shared → widgets → features → screens (см. [карту слоёв](#карта-слоёв-fsd)).
3. **Один экран — один PR** — доводим до DoD из [testing.md](../engineering/testing.md), затем следующий.
4. **Данные только через Repository** — widgets/features не вызывают `fetch` напрямую.
5. **Backend = смена адаптера** — UI не меняется при `msw` → `http` ([local-first.md](../engineering/local-first.md)).

---

## Карта слоёв (FSD)

Порядок сборки — **снизу вверх**. Каждый блок ссылается на spec в [components/](../ux/components/).

```
shared/
├── ui/              shadcn primitives, icons ([shared-ui.md](../ux/components/shared-ui.md))
├── lib/             routes, breadcrumbs, replies, noteEmbeds …
├── api/             repositories, MSW, schemas  ← уже есть
└── data/            seed-data, analytics-seed   ← уже есть

entities/
├── post/            usePosts, types
├── chat/            useGlobalChats, useLocalChats
├── note/            useGlobalNotes, useLocalNotes
└── channel/         useProfile

features/            ← 🟡 ~50% (8 slices + embedded logic)
├── post-context-menu/   ✅ slice
├── schedule-post/       ✅ slice
├── manage-drafts/       ✅ slice
├── delete-chat/ rename-chat/ delete-note/ rename-note/ edit-chat-message/  ✅ slices
├── send-message/        🟡 → composer-store.tsx + replies.ts
├── publish-post/        🟡 → post-context-menu
├── note-ai-flag/        🟡 → entities/note + screens
└── …                    см. [features.md](../ux/components/features.md), [Фаза 4](#фаза-4--features-сценарии)

widgets/             ← 🟡 ~85%
├── app-shell/       ✅ [app-shell.md](../ux/components/widgets/app-shell.md)
├── sidebar/         ✅ [sidebar.md](../ux/components/widgets/sidebar.md)
├── page-header/     ✅ [page-header.md](../ux/components/widgets/page-header.md)
├── filter-toolbar/  ✅ [filter-toolbar.md](../ux/components/widgets/filter-toolbar.md)
├── composer/        🟡 → home, gchat, post, feed
├── chat-thread/     🟡 → gchat, post chat
├── feed/            🟡 + screens/feed
├── post-workspace/  🟡 → PostScreen
├── note-editor/     🟡 → NoteScreen (DnD в доработке)
├── charts/          🟡 → analytics-dashboard
├── analytics-dashboard/ 🟡 + screen heatmap/table
└── profile-settings/    🟡 → profile tabs

screens/             ← 🟡 ~75% — тонкая композиция widgets
├── home/ gchat/ feed/ post/ note/
├── chats/ notes/     ← ближе к done
├── analytics/ profile/
```

---

## Карта экранов → код

| Screen | URL | Screen component | Key widgets |
|--------|-----|------------------|-------------|
| home | `/` | [`screens/home/HomeScreen.tsx`](../../src/screens/home/HomeScreen.tsx) | Composer |
| gchat | `/gchat/?id=` | [`screens/gchat/GChatScreen.tsx`](../../src/screens/gchat/GChatScreen.tsx) | chat-thread, Composer |
| feed | `/feed/` | [`screens/feed/FeedScreen.tsx`](../../src/screens/feed/FeedScreen.tsx) | feed, manage-drafts |
| post | `/post/{id}/` | [`screens/post/PostScreen.tsx`](../../src/screens/post/PostScreen.tsx) | post-workspace, filter-toolbar, Composer |
| note | `/note/*` | [`screens/note/NoteScreen.tsx`](../../src/screens/note/NoteScreen.tsx) | note-editor |
| chats | `/chats/` | [`screens/chats/ChatsScreen.tsx`](../../src/screens/chats/ChatsScreen.tsx) | filter-toolbar, chat-thread cards |
| notes | `/notes/` | [`screens/notes/NotesScreen.tsx`](../../src/screens/notes/NotesScreen.tsx) | filter-toolbar, NoteCardAiToggle |
| analytics | `/analytics/` | [`screens/analytics/AnalyticsScreen.tsx`](../../src/screens/analytics/AnalyticsScreen.tsx) | analytics-dashboard, charts |
| profile | `/profile/` | [`screens/profile/ProfileScreen.tsx`](../../src/screens/profile/ProfileScreen.tsx) | profile-settings |

---

## Track A — Frontend (основной)

### Фаза 0 — Документация ✅

- [x] Product, UX (pages, wireframes, components), engineering
- [x] API contract, data model, routing, deploy, testing
- [x] Product-docs aligned with legacy UI

**Выход:** можно разрабатывать без устных договорённостей.

---

### Фаза 1 — Foundation ✅ (закрыть хвосты)

**Цель:** инфраструктура готова, все URL открываются (хотя бы placeholder).

| Задача | Spec | Статус |
|---|---|---|
| Repository + MSW + seed | [local-first.md](../engineering/local-first.md) | ✅ |
| TanStack Query entities | [data-model.md](../engineering/data-model.md) | ✅ |
| `routes.ts`, parseAppPath | [routing.md](../engineering/routing.md) | ✅ |
| Providers (MSW, theme, query, repo) | [architecture.md](../engineering/architecture.md) | ✅ |
| CI: typecheck, lint, test, e2e, build | [testing.md](../engineering/testing.md) | ✅ |
| **Маршруты Next.js для всех URL** | [routing.md](../engineering/routing.md) | ✅ |
| RouteSync + legacy redirects | [routing.md](../engineering/routing.md) | ✅ |
| Screen components (gchat, post, note) | [pages.md](../ux/pages.md) | ✅ |

**DoD фазы:** каждый URL из таблицы routing открывается без 404; `npm run check` green.

---

### Фаза 2 — App shell & навигация ✅

**Цель:** пользователь может ходить по всему приложению; sidebar и header как в legacy.

| Задача | Spec | Статус |
|---|---|---|
| Sidebar: nav, recents (posts, notes, chats), collapse | [sidebar.md](../ux/components/widgets/sidebar.md) | ✅ |
| PageHeader: left / center / right slots, glass, menus | [page-header.md](../ux/components/widgets/page-header.md) | ✅ |
| PageHeaderMenuButton + overlay sidebar | [app-shell.md](../ux/components/widgets/app-shell.md) | ✅ |
| RouteSync + ContentAdaptSync | [app-shell.md](../ux/components/widgets/app-shell.md) | ✅ |
| Breadcrumbs (`breadcrumbTrails.ts`) | [routing.md](../engineering/routing.md) | ✅ post; 🟡 note (audit pending) |
| `← Назад` через `getParentPath` / `router.back()` | [pages.md](../ux/pages.md) | ✅ |
| ScreenShell layout (nav + content) | [screens.md](../ux/components/screens.md) | ✅ |

**DoD:** [flows.md](../ux/flows.md) — navigation flows вручную; E2E shell smoke + gchat legacy redirect.

---

### Фаза 3 — Shared widgets (горизонтальный слой) 🟡 ~85%

**Цель:** переиспользуемые блоки готовы до наполнения экранов. Порядок — по зависимостям.

| # | Widget | Зависит от | Spec | Статус | Где в коде |
|---|---|---|---|---|---|
| 3.1 | **composer** | shared/ui, mention dropdown | [composer.md](../ux/components/widgets/composer.md) | 🟡 | [`widgets/composer`](../../src/widgets/composer/) → home, gchat, post, feed |
| 3.2 | **chat-thread** | composer (read-only msgs) | [chat-thread.md](../ux/components/widgets/chat-thread.md) | 🟡 | [`widgets/chat-thread`](../../src/widgets/chat-thread/) |
| 3.3 | **filter-toolbar** | shared/ui | [filter-toolbar.md](../ux/components/widgets/filter-toolbar.md) | ✅ | [`widgets/filter-toolbar`](../../src/widgets/filter-toolbar/) |
| 3.4 | **feed** | post card, DnD, composer (draft) | [feed.md](../ux/components/widgets/feed.md) | 🟡 | [`widgets/feed`](../../src/widgets/feed/) + `screens/feed` |
| 3.5 | **post-workspace** | feed card inline, filter-toolbar | [post-workspace.md](../ux/components/widgets/post-workspace.md) | 🟡 | [`widgets/post-workspace`](../../src/widgets/post-workspace/) |
| 3.6 | **note-editor** | noteEmbeds lib | [note-editor.md](../ux/components/widgets/note-editor.md) | 🟡 | [`widgets/note-editor`](../../src/widgets/note-editor/) |
| 3.7 | **charts** | recharts wrappers | [charts.md](../ux/components/widgets/charts.md) | 🟡 | [`widgets/charts`](../../src/widgets/charts/) |
| 3.8 | **analytics-dashboard** | charts, period filter | [analytics-dashboard.md](../ux/components/widgets/analytics-dashboard.md) | 🟡 | [`widgets/analytics-dashboard`](../../src/widgets/analytics-dashboard/) |
| 3.9 | **profile-settings** | forms, dirty state | [profile-settings.md](../ux/components/widgets/profile-settings.md) | 🟡 | [`widgets/profile-settings`](../../src/widgets/profile-settings/) |

**DoD каждого widget:** Storybook не обязателен; RTL smoke или unit на lib; соответствие component spec; нет import нарушений FSD.

---

### Фаза 4 — Features (сценарии) 🟡 ~50%

**Цель:** бизнес-действия вынесены из widgets в `features/`.

| Feature | Экраны | Spec | Статус | Где в коде |
|---|---|---|---|---|
| `post-context-menu` | post header | [features.md](../ux/components/features.md) | ✅ slice | `features/post-context-menu` |
| `schedule-post` | post, feed | context menu | ✅ slice | `features/schedule-post` |
| `manage-drafts` | feed | DnD reorder → repository | ✅ slice | `features/manage-drafts` → `FeedDraftsSection` |
| `delete-chat` / `rename-chat` | gchat, chats | — | ✅ slices | `features/delete-chat`, `rename-chat` |
| `delete-note` / `rename-note` | note, notes | — | ✅ slices | `features/delete-note`, `rename-note` |
| `edit-chat-message` | gchat, post | — | ✅ slice | `features/edit-chat-message` |
| `send-message` | home, gchat, post | stub AI → MSW | 🟡 embedded | [`composer-store.tsx`](../../src/app/model/store/composer-store.tsx) + `replies.ts` |
| `attach-post-mention` | home, gchat | `@` mention → chip | 🟡 embedded | `widgets/composer/model/editor/useComposerMentions.ts` |
| `attach-media` | composer scopes | attach menus | 🟡 embedded | `widgets/composer/ui/Attach*.tsx` |
| `publish-post` | post, feed | context menu | 🟡 embedded | `usePostCtxMenu.tsx` → `useUpdatePost` |
| `inline-edit-post` | post chat mode | textarea + media | 🟡 embedded | `PostMessageCard.tsx` + `usePostWorkspace.tsx` |
| `note-ai-flag` | note, notes catalog | toggle context | 🟡 embedded | `entities/note`, `useNoteScreen`, `useNotesScreen` |
| `profile-save` | profile tabs | dirty confirm | 🟡 embedded | `profile-settings/model/*` + `ui-store` dirtyMap |

**DoD:** feature вызывает только repository hooks / mutations; покрыт unit или e2e happy path. Оставшиеся 🟡 — вынести в `features/` при рефакторинге.

---

### Фаза 5 — Экраны (вертикальная сборка) 🟡 ~75%

**Цель:** каждый экран = полная parity с legacy. Порядок — от простого к сложному.

| # | Screen | URL | Wireframe | Parity | E2E smoke | E2E deep (planned) |
|---|---|---|---|---|---|---|
| 5.1 | **home** | `/` | [01-home](../ux/wireframes/01-home.md) | 🟡 | ✅ send → gchat | attach, `@` mention |
| 5.2 | **gchat** | `/gchat/?id=` | [05-global-chat](../ux/wireframes/05-global-chat.md) | 🟡 | ✅ load, back, redirect | delete, message edit |
| 5.3 | **feed** | `/feed/` | [02-feed](../ux/wireframes/02-feed.md) | 🟡 | ✅ nav, sections | open post, draft DnD |
| 5.4 | **post** | `/post/{id}/` | [03-post](../ux/wireframes/03-post.md) | 🟡 | ✅ load, redirect | modes, edit, menu |
| 5.5 | **note** | `/note/*` | [04-note](../ux/wireframes/04-note.md) | 🟡 | ✅ global note load | edit, DnD, dirty |
| 5.6 | **chats** | `/chats/` | [06-chats](../ux/wireframes/06-chats.md) | ✅ | ✅ scope, back | open chat from catalog |
| 5.7 | **notes** | `/notes/` | [07-notes](../ux/wireframes/07-notes.md) | ✅ | ✅ nav, filter UI | AI filter interaction |
| 5.8 | **analytics** | `/analytics/` | [08-analytics](../ux/wireframes/08-analytics.md) | 🟡 | ✅ load | period switch |
| 5.9 | **profile** | `/profile/` | [09-profile](../ux/wireframes/09-profile.md) | 🟡 | — | tabs, dirty |

**DoD экрана** ([testing.md](../engineering/testing.md)):

- [ ] Соответствует [pages.md](../ux/pages.md) и wireframe
- [ ] Seed загружается без ошибок
- [ ] `← Назад` по [routing.md](../engineering/routing.md)
- [ ] `npm run check` green
- [ ] E2E smoke добавлен
- [ ] Строка в [parity.md](../ux/parity.md) → `done`

---

### Фаза 6 — Local-first completeness

**Цель:** demo полностью функционален без backend.

| Задача | Doc |
|---|---|
| MSW handlers = 100% [API_CONTRACT.yaml](../engineering/API_CONTRACT.yaml) | [api-schemas.md](../engineering/api-schemas.md) |
| Stub AI: global + post scopes, after-edit reply | [local-first.md](../engineering/local-first.md) |
| Seed parity с legacy (5 posts, 4 notes, 2 gchats, profile, analytics) | seed-data.ts |
| CRUD: posts, notes, chats, profile — через UI | manual + e2e |
| Persistence limits documented (theme, sidebar only) | local-first.md |

**DoD:** новый пользователь может пройти [09-user-scenario.md](./09-user-scenario.md) на demo без backend.

---

### Фаза 7 — Polish

**Цель:** production-quality UI на Tailwind/shadcn.

| Задача | Spec |
|---|---|
| Design tokens: legacy CSS → Tailwind | [design-tokens.md](../ux/design-tokens.md) |
| Breakpoints: desktop / tablet / feed width toggle | pages.md § feed |
| Loading / empty / error states на всех экранах | conventions |
| Focus, keyboard на composer и menus | a11y baseline |
| Confirm dialogs (dirty, delete) | wireframes |

**DoD:** визуально не хуже legacy; нет «сырых» placeholder-текстов на экранах.

---

### Фаза 8 — GitHub Pages release

**Цель:** публичная demo по URL репозитория.

| Задача | Doc |
|---|---|
| Static export с `output: "export"` | [deploy.md](../engineering/deploy.md) |
| `NEXT_PUBLIC_BASE_PATH=/Repositories_Info/Docs_TG_Platform/web` | deploy.md |
| **Demo mode:** `NEXT_PUBLIC_USE_MSW=1` + `mockServiceWorker.js` в `out/` | local-first.md |
| Workflow `web-pages.yml` (или deploy job в `web-ci.yml`) | новый CI job |
| `copy-404.mjs` для SPA fallback | [`web/scripts/copy-404.mjs`](../../scripts/copy-404.mjs) |
| README badge + ссылка на live demo | [web/README](../../README.md) |

**DoD:** по ссылке GitHub Pages открывается home, sidebar работает, данные из seed, MSW перехватывает API.

**Prod без demo (опционально):** `USE_MSW=0` + backend URL — тот же билд, другие env ([deploy.md](../engineering/deploy.md)).

---

### Фаза 9 — Backend-ready gate

**Цель:** фронт готов принять REST API без рефакторинга UI.

| Задача | Doc |
|---|---|
| `httpRepositories.ts` — все методы из contract | [BACKEND_READINESS.md](../engineering/BACKEND_READINESS.md) |
| Contract tests: MSW response shape = zod schemas | testing.md |
| Env switch documented in `.env.example` | [`web/.env.example`](../../.env.example) |
| CORS checklist для self-hosted | deploy.md |
| Hook для SSE AI (`POST /ai/chat`) — interface only, stub fallback | BACKEND_READINESS §4 |

**DoD:** checklist [BACKEND_READINESS.md](../engineering/BACKEND_READINESS.md) §3 полностью зелёный против mock server или staging API.

---

## Track B — Backend (после фронтенда)

Не блокирует GitHub Pages demo. Реализуется параллельно или после **Фазы 9**.

| Этап | Содержание | Product doc |
|---|---|---|
| B1 Persistence | PostgreSQL/SQLite, sync с REST | [API_CONTRACT.yaml](../engineering/API_CONTRACT.yaml) |
| B2 Telegram | MTProto import, publish, comments | [05-channel-profile.md](./05-channel-profile.md) |
| B3 Real LLM | OpenAI-compatible, streaming SSE | [04-ai-system.md](./04-ai-system.md) |
| B4 Agent actions | publish, create draft by command | 04-ai-system |
| B5 Auth / multi-user | out of legacy scope | future |

Roadmap-память (MemPalace, log-чат, reusable-modules) — [04b](./04b-ai-system-mempalace.md), [11](./11-reusable-modules-integration.md), [13](./13-chat-context-summaries.md) — **backend architecture**, не UI.

---

## Сводная таблица фаз

| Фаза | Название | Результат | Зависит от | Статус |
|---|---|---|---|---|
| 0 | Документация | Spec complete | — | ✅ |
| 1 | Foundation | Все URL + CI | 0 | ✅ |
| 2 | Shell & nav | Sidebar, header, flows | 1 | ✅ |
| 3 | Widgets | 9 переиспользуемых блоков | 2 | 🟡 ~85% |
| 4 | Features | Сценарии в `features/` | 3 | 🟡 ~50% |
| 5 | Screens | 9 экранов parity | 3, 4 | 🟡 ~75% |
| 6 | Local-first | Full demo CRUD + stub AI | 5 | 🔴 |
| 7 | Polish | Visual parity | 5 | 🔴 |
| 8 | GitHub Pages | Public URL | 6, 7 | 🔴 |
| 9 | Backend-ready | http mode works | 6 | 🔴 |
| B* | Backend | Real data & AI | 9 | — |

Фазы 6 и 7 можно частично параллелить. **Фаза 8** возможна после 6 (minimal polish), **идеальный** release — после 7.

---

## Оценка объёма (ориентир)

| Фаза | Ориентир | Комментарий |
|---|---|---|
| 1 (хвосты) | 2–3 дня | маршруты + RouteSync |
| 2 | 3–5 дней | shell parity |
| 3 | 2–3 недели | самый большой слой |
| 4 | 1 неделя | параллельно с 5 |
| 5 | 2–3 недели | post workspace — ~40% |
| 6–7 | 1–2 недели | |
| 8–9 | 2–4 дня | CI + verify |

**Итого frontend track:** ~6–10 недель одного разработчика при следовании spec без scope creep.

---

## Порядок чтения при старте работы

1. [pages.md](../ux/pages.md) — экран, который делаете сейчас
2. Wireframe + [components/](../ux/components/) — widget spec
3. [data-model.md](../engineering/data-model.md) + repository method
4. DoD из [testing.md](../engineering/testing.md)
5. Обновить [parity.md](../ux/parity.md)

---

## Связанные документы

- [web-client.md](../engineering/web-client.md) — границы клиента
- [parity.md](../ux/parity.md) — трекер экранов
- [deploy.md](../engineering/deploy.md) — GitHub Pages
- [BACKEND_READINESS.md](../engineering/BACKEND_READINESS.md) — подключение API
- [doc-maintenance.md](../doc-maintenance.md) — когда обновлять docs
