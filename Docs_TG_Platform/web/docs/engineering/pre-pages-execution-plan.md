# План до GitHub Pages (от текущей точки)

Пошаговый план: **M3 → M4 → M5 → demo-polish → M6 GitHub Pages**.

**Backend (M7 / Track B) — после Pages.** Demo на Pages работает на **MSW + seed** (`NEXT_PUBLIC_USE_MSW=1`).

Детальные чекбоксы: [m3-m5-gate-checklist.md](./m3-m5-gate-checklist.md). Статус экранов: [parity.md](../ux/parity.md).

---

## Точка старта (сейчас)

| Слой | Статус |
|------|--------|
| M1 Foundation, M2 Shell | ✅ |
| M3 Widgets | 🟡 ~85% |
| M4 Screens | 🟡 ~75% — **2/9 done** (chats, notes) |
| M5 Local-first | 🔴 |
| M6 Pages | 🔴 |
| CI `npm run check` | ✅ |
| E2E | 12 smoke-тестов |

**Не блокируют Pages:** note DnD edge cases, refactor features → `features/`, backend, Tailwind migration.

---

## Целевая картина

```
[Сейчас]  M3/M4 partial
    ↓
[Этап 1]  Demo-polish (надёжность UX)
    ↓
[Этап 2]  post + feed → done
    ↓
[Этап 3]  home + gchat + note → done
    ↓
[Этап 4]  profile + analytics → done
    ↓
[Этап 5]  M5: user-scenario + CRUD
    ↓
[Этап 6]  E2E critical path
    ↓
[Этап 7]  M6: GitHub Pages deploy + smoke на live URL
    ↓
[Потом]   M7 backend
```

**Критерий «можно на Pages»:** все пункты [Gate — финальный допуск](./m3-m5-gate-checklist.md#gate--финальный-допуск) в gate-checklist.

---

## Этап 0 — Подготовка (0.5 дня)

Один раз перед серией PR.

- [ ] Прочитать [m3-m5-gate-checklist.md](./m3-m5-gate-checklist.md) целиком
- [ ] Локально: `cd Docs_TG_Platform/web && npm run dev` — убедиться, что seed грузится
- [ ] Baseline: `npm run check` green
- [ ] Открыть legacy (`web-legacy`) рядом для визуального сравнения

**Выход:** baseline зафиксирован, знаете порядок работ.

---

## Этап 1 — Demo-polish (2–3 дня)

Делать **до** или **параллельно** этапам 2–4. Без этого demo на Pages будет выглядеть сырой.

| # | Задача | Файлы / зона |
|---|--------|----------------|
| 1.1 | `ErrorBoundary` в провайдерах | `app/providers/AppProviders.tsx` |
| 1.2 | MSW startup error → UI, не тихий crash | `app/providers/MswProvider.tsx` |
| 1.3 | shadcn `AlertDialog` + `useConfirm()` | `shared/ui/` |
| 1.4 | Заменить `window.confirm` | delete-note/chat, profile, sidebar, noteLeave, userMessageEditSession |
| 1.5 | Заменить `window.alert` | `composer-store.tsx` |
| 1.6 | `onError` / toast на ключевые mutations | composer-store, delete-*, profile save, post workspace |

**PR:** `feat: demo-polish error handling and confirm dialogs`

**Выход:** нет native alert/confirm на user flows; приложение не падает целиком от одной ошибки.

**Gate:** [§ Polish](./m3-m5-gate-checklist.md#polish-обязательно-до-pages)

---

## Этап 2 — post + feed (4–6 дней)

~40% оставшегося UX. Критичен для [09-user-scenario](../product/09-user-scenario.md) акты 3–4.

### PR 2a: feed → done

Wireframe: [02-feed](../ux/wireframes/02-feed.md)

- [ ] Ручной проход vs legacy: секции, search, width toggle, PostCommentsRow
- [ ] Composer → новый черновик в «Черновики»
- [ ] Click card → `/post/{id}/`
- [ ] Draft DnD reorder (session)
- [ ] E2E: open post, create draft
- [ ] Widgets: `feed`, `manage-drafts` — отметить в gate-checklist
- [ ] **parity.md:** feed → `done`

### PR 2b: post → done

Wireframe: [03-post](../ux/wireframes/03-post.md)

- [ ] Режимы: chat, notes, chats, comments — переключение, FilterToolbar
- [ ] Inline edit карточки → save
- [ ] Context menu: publish / schedule / delete по status
- [ ] Composer scope post, local chat create
- [ ] E2E: modes, publish draft, inline edit
- [ ] Widgets: `post-workspace`, `composer`, `filter-toolbar` — gate-checklist
- [ ] **parity.md:** post → `done`

**Выход:** сценарий «черновик → работа → публикация» работает end-to-end.

---

## Этап 3 — home + gchat + note (3–4 дня)

### PR 3a: home + gchat

- [ ] **home:** send → gchat, attach, `@` mention (wireframe [01-home](../ux/wireframes/01-home.md))
- [ ] **gchat:** thread, delete, edit message + stub (wireframe [05-global-chat](../ux/wireframes/05-global-chat.md))
- [ ] E2E: gchat delete, `@` mention (home)
- [ ] Widgets: `composer`, `chat-thread` — gate-checklist
- [ ] **parity.md:** home, gchat → `done`

### PR 3b: note → done (без долгого DnD)

Wireframe: [04-note](../ux/wireframes/04-note.md)

- [ ] view/edit, save, dirty leave, AI flag, delete, new note
- [ ] Attach + embed (core) — **DnD edge cases отложить**
- [ ] E2E: edit, save, dirty confirm
- [ ] Widget: `note-editor` — gate-checklist
- [ ] **parity.md:** note → `done`

**Выход:** AI-flow (home → gchat → note) из scenario актов 2–3 закрыт.

---

## Этап 4 — profile + analytics + sanity (2–3 дня)

### PR 4a: profile

Wireframe: [09-profile](../ux/wireframes/09-profile.md)

- [ ] 3 вкладки, save всех блоков, dirty на смене таба
- [ ] E2E: tabs, dirty
- [ ] Widget: `profile-settings` — gate-checklist
- [ ] **parity.md:** profile → `done`

### PR 4b: analytics

Wireframe: [08-analytics](../ux/wireframes/08-analytics.md)

- [ ] 5 периодов, heatmap, top posts, open post
- [ ] Удалить orphan `widgets/analytics/ui/analytics-period-filter.tsx`
- [ ] E2E: period switch
- [ ] Widgets: `analytics-dashboard`, `charts` — gate-checklist
- [ ] **parity.md:** analytics → `done`

### PR 4c: sanity chats + notes

- [ ] Повторный проход chats/notes vs wireframe
- [ ] E2E: notes AI filter click
- [ ] **parity.md:** подтвердить `done`

**Выход:** 9/9 экранов `done` в parity.md.

---

## Этап 5 — M5 Local-first (2–3 дня)

### PR 5: scenario + CRUD

- [ ] Прогон [09-user-scenario](../product/09-user-scenario.md) — отметить в [gate § Сценарный](./m3-m5-gate-checklist.md#сценарный-чеклист)
- [ ] Прогон [flows 1–12](../ux/flows.md) — gate § Navigation flows
- [ ] CRUD matrix — gate § M5
- [ ] Баги из прогона → фикс PR(ы)
- [ ] Повторный прогон до зелёного

**Выход:** demo полностью проходится без backend; reload → seed (ожидаемо).

---

## Этап 6 — E2E critical path (1–2 дня)

### PR 6: дополнить `e2e/shell.spec.ts`

Добавить тесты из [gate § E2E](./m3-m5-gate-checklist.md#e2e--critical-path):

- [ ] feed → open post
- [ ] post → publish draft
- [ ] post → mode switch
- [ ] note → edit + save
- [ ] profile → tabs
- [ ] gchat → delete
- [ ] analytics → period switch

**Выход:** `npm run check` green; регрессии ловятся в CI.

---

## Этап 7 — M6 GitHub Pages (1–2 дня)

Spec: [deploy.md](./deploy.md)

### PR 7a: workflow

- [ ] Создать `.github/workflows/web-pages.yml` (или deploy job в CI)
- [ ] Build env:
  ```yaml
  NEXT_PUBLIC_BASE_PATH: /Repositories_Info/Docs_TG_Platform/web
  NEXT_PUBLIC_USE_MSW: "1"
  ```
- [ ] Steps: `npm ci` → `npm run build` → upload `out/` → deploy Pages
- [ ] `copy-404.mjs` после build (SPA fallback)
- [ ] `mockServiceWorker.js` попадает в `out/`

### PR 7b: docs + smoke

- [ ] README: badge + live URL
- [ ] Локально проверить build с `BASE_PATH`:
  ```bash
  cd Docs_TG_Platform/web
  NEXT_PUBLIC_BASE_PATH=/Repositories_Info/Docs_TG_Platform/web \
  NEXT_PUBLIC_USE_MSW=1 \
  npm run build
  npx serve out
  ```
- [ ] Smoke на live URL:
  - [ ] home загружается
  - [ ] sidebar → feed → post
  - [ ] send → gchat
  - [ ] seed данные видны
  - [ ] нет 404 на assets (base path)

### Sign-off

- [ ] [Gate — финальный допуск](./m3-m5-gate-checklist.md#gate--финальный-допуск) — все `[x]`
- [ ] [parity.md](../ux/parity.md) — 9/9 `done`
- [ ] `npm run check` green на main

**Выход:** публичный URL demo. **Backend — следующий этап (M7).**

---

## Сводка по срокам (ориентир, 1 разработчик)

| Этап | Дни | Накопительно |
|------|-----|--------------|
| 0 Подготовка | 0.5 | 0.5 |
| 1 Demo-polish | 2–3 | 3 |
| 2 post + feed | 4–6 | 9 |
| 3 home + gchat + note | 3–4 | 13 |
| 4 profile + analytics | 2–3 | 16 |
| 5 M5 scenario | 2–3 | 19 |
| 6 E2E | 1–2 | 21 |
| 7 Pages deploy | 1–2 | **~3 недели** |

Параллельно: этап 1 можно начать в день 1; этап 6 частично — вместе с этапами 2–4.

---

## Порядок PR (кратко)

```
1. demo-polish
2a. feed done
2b. post done
3a. home + gchat done
3b. note done
4a. profile done
4b. analytics done
4c. chats/notes sanity
5. scenario fixes (если нужно)
6. e2e critical path
7. github pages deploy
```

---

## После Pages (не входит в этот план)

| Этап | Содержание |
|------|------------|
| M7 backend | `USE_MSW=0`, API_CONTRACT, BACKEND_READINESS |
| Полный polish | design tokens, a11y audit, virtualization |
| Note DnD polish | edge cases, если остались |

---

## Связанные документы

- [m3-m5-gate-checklist.md](./m3-m5-gate-checklist.md) — полные чекбоксы
- [08-roadmap.md](../product/08-roadmap.md) — фазы продукта
- [frontend-roadmap.md](./frontend-roadmap.md) — milestones M0–M7
- [parity.md](../ux/parity.md) — трекер экранов
- [deploy.md](./deploy.md) — build и env для Pages
