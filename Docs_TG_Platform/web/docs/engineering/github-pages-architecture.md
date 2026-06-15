# Идеальный фронтенд для GitHub Pages

Целевая архитектура **статического demo** на GitHub Pages: MSW + seed, без backend, без ориентации на legacy-parity.

**Не путать с M7:** после подключения API часть решений пересматривается (MSW off, `posts.get(id)`, Zod на HTTP).

---

## Что значит «идеально» для Pages

| Критерий | Смысл |
|----------|--------|
| **Deployable** | `output: export`, `basePath`, `404.html`, CI build + deploy |
| **Self-contained demo** | MSW в бандле, seed в памяти, reload → исходное состояние |
| **FSD без дыр** | Слои соблюдены, нет циклов widgets, boundaries в ESLint |
| **Надёжный UX** | ErrorBoundary, confirm dialogs, guarded navigation, toast на ошибках |
| **Проверяемость** | `npm run check`, E2E smoke в CI |
| **Чистота без over-engineering** | Нет React.memo/code-split «на будущее» без профилирования |

**Не входит в «идеал Pages»:** parity 9/9, полный user-scenario, виртуализация списков, optimistic updates, полный a11y audit.

---

## Целевая схема

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages (static out/)                             │
│  NEXT_PUBLIC_BASE_PATH=/my  (repo saltolist/my)        │
│  NEXT_PUBLIC_USE_MSW=1                                  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  app/          providers, RouteSync, shell layout       │
├─────────────────────────────────────────────────────────┤
│  screens/      orchestration, PageHeader, useScreen*    │
├─────────────────────────────────────────────────────────┤
│  widgets/      composer, feed, post-workspace, …        │
│  features/     delete-note, post-context-menu, …        │
│  entities/     post, note, message + repositories       │
├─────────────────────────────────────────────────────────┤
│  shared/       ui, lib, api (без domain-логики постов)  │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch /api/v1/*
┌──────────────────────────▼──────────────────────────────┐
│  MSW (public/mockServiceWorker.js) → in-memory seed     │
└─────────────────────────────────────────────────────────┘
```

**Правила импорта:** только вниз по FSD; `app` → widgets допустим для bootstrap (ProfileHydrator — осознанное исключение или вынести в shell).

---

## Уже соответствует цели

- Next.js static export, `trailingSlash`, `copy-404.mjs`
- FSD + `eslint-plugin-boundaries`
- Repository pattern + TanStack Query
- Demo-polish: ErrorBoundary, Dialog, Toast, guarded navigation
- `web-ci.yml`: typecheck, lint, unit, E2E, build с `BASE_PATH`
- E2E smoke (17 тестов)

---

## Обязательно до «идеального Pages»

### P0 — Deploy (этап 7)

- [x] Workflow `.github/workflows/web-pages.yml` (build + deploy artifact)
- [x] Build env: `NEXT_PUBLIC_BASE_PATH=/my`, `NEXT_PUBLIC_USE_MSW=1`
- [ ] Smoke на live URL: home, sidebar, feed, MSW seed (после merge в `main` + enable Pages)
- [x] README: URL Pages + local preview

### P1 — Архитектурная гигиена (малый diff, высокий эффект)

- [ ] Разорвать цикл `widgets/feed` ↔ `widgets/post-workspace`  
  → `PostReactionPills`, `PostViewsReposts`, `PostCommentsRow` в `entities/post/ui`
- [ ] DOMPurify для `dangerouslySetInnerHTML` в chat messages (demo тоже не должен быть XSS-дырявым)
- [ ] Дубли: `copyPlainText`, `CloseIcon`, `useResendCooldown`, `CHAT_PREVIEW_MAX_LENGTH=80`

### P2 — Качество без fanaticism

- [ ] Именованные константы вместо magic timeouts
- [ ] Пустые `catch {}` → log или явный комментарий «ignored»
- [ ] `useUi()` — потребители через селекторы, не весь объект

**Отложить до M7:** `posts.get(id)` на реальном API, optimistic updates, React.lazy, pagination, Zod на каждый response.

---

## MSW в `dependencies`

Для **Pages demo** `msw` в `dependencies` — **норма**: service worker и handlers должны попасть в production bundle.  
Перед M7: отдельный build profile `USE_MSW=0` + real API (см. [deploy.md](./deploy.md)).

---

## Критерий готовности «идеальный Pages»

1. Live URL открывается, seed виден, навигация работает под `basePath`
2. `npm run check` green на main
3. Нет циклических imports widgets (ESLint boundaries)
4. XSS в chat messages санитизирован
5. Дубли из P1 сведены к одному модулю
6. Legacy и parity.md **не** блокируют релиз

---

## Связанные документы

- [mobile-ux-fix-plan.md](./mobile-ux-fix-plan.md) — mobile UX + черновики (post-Pages QA)
- [auth-onboarding-plan.md](./auth-onboarding-plan.md) — вход, регистрация, онбординг канала
- [deploy.md](./deploy.md) — env, nginx, checklist
- [pre-pages-execution-plan.md](./pre-pages-execution-plan.md) — исторический план (этапы 3–6 опциональны)
- [local-first.md](./local-first.md) — MSW / seed / http
- Tech review: `.mimocode/plans/1781368856666-gentle-river.md` — backlog на M7+
