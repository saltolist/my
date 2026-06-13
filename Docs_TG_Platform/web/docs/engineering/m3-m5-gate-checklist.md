# M3–M5 Gate Checklist

Чеклист закрытия **M3 (widgets)**, **M4 (features + screens)** и **M5 (local-first demo)** перед **M6 GitHub Pages**.

**Пошаговый план (PR-порядок, сроки):** [pre-pages-execution-plan.md](./pre-pages-execution-plan.md).

**Правило:** Pages deploy только когда все пункты в § [Gate — финальный допуск](#gate--финальный-допуск) отмечены.

Связанные документы:

- [08-roadmap.md](../product/08-roadmap.md) — фазы и карта экранов → код
- [parity.md](../ux/parity.md) — статус экранов (обновлять по мере закрытия)
- [09-user-scenario.md](../product/09-user-scenario.md) — narrative demo
- [flows.md](../ux/flows.md) — navigation flows
- [testing.md](./testing.md) — DoD и E2E
- [local-first.md](./local-first.md) — MSW, seed, stub AI

---

## Как пользоваться

1. Идти **сверху вниз** по плановым секциям (M3 → M4 → M5 → polish).
2. После каждого экрана / widget — обновить строку в [parity.md](../ux/parity.md).
3. В конце — прогон **§ Сценарный чеклист** и **§ Navigation flows**.
4. Запустить `npm run check`.
5. Отметить **§ Gate — финальный допуск**.

**Note DnD:** edge cases (тряска, media↔text boundary) — отложены; блокируют gate только если ломают save/edit/attach или user-scenario.

---

## Gate — финальный допуск

Все пункты обязательны перед M6.

- [ ] M3: все widgets ✅ (§ M3)
- [ ] M4: все features работают (§ M4 Features)
- [ ] M4: все 9 экранов `done` в [parity.md](../ux/parity.md) (§ M4 Screens)
- [ ] M5: CRUD matrix зелёная (§ M5)
- [ ] M5: [09-user-scenario](../product/09-user-scenario.md) пройден без обходных путей (§ Сценарный)
- [ ] [flows.md](../ux/flows.md) flows 1–12 вручную OK (§ Navigation flows)
- [ ] Demo polish (§ Polish)
- [ ] E2E critical path (§ E2E)
- [ ] `npm run check` green
- [ ] Reload demo: данные сбрасываются к seed — **ожидаемо**, без crash

---

## M3 — Widgets

DoD: [component spec](../ux/components/widgets/) = legacy 1:1; widget используется на экранах без functional gaps.

### Shell (уже ✅ — sanity)

- [x] app-shell — RouteSync, ContentAdaptSync, ScreenShell
- [x] sidebar — nav, recents, collapse, post row menu
- [x] page-header — slots, search, select, overflow, glass
- [x] filter-toolbar — tabs + action button

### composer

Spec: [composer.md](../ux/components/widgets/composer.md)

- [ ] Scopes: `home`, `gchat`, `post`, `feed` — attach-меню по spec
- [ ] Auto-resize: home max 10 lines; gchat/post/feed max 16
- [ ] LLM + Web Search pills (ModelPicker)
- [ ] MultiReplyToggle (если несколько моделей в профиле)
- [ ] `@` mention → post chip (`@title;`)
- [ ] Attach: file, media from posts (home/gchat/post)
- [ ] Feed scope: `+` → file picker без меню
- [ ] Send → repository mutation + navigation (home → gchat)
- [ ] Нет `window.alert` для «Активируйте LLM»

### chat-thread

Spec: [chat-thread.md](../ux/components/widgets/chat-thread.md)

- [ ] User message: hover edit, branch nav
- [ ] AI message: single + multi variant, toolbar
- [ ] After user edit → stub `STUB_REPLY_AFTER_USER_EDIT`
- [ ] ChatListCardMenu: rename, delete
- [ ] Omnichannel: edit без веток

### feed

Spec: [feed.md](../ux/components/widgets/feed.md)

- [ ] PostCard: media, text, status icon, metrics, PostCommentsRow
- [ ] Published: day groups
- [ ] Scheduled section
- [ ] Drafts: 6-dot DnD handle, reorder → repository
- [ ] feed-header-toolbar: search + width toggle (500/390/270)
- [ ] FeedComposer → create draft

### post-workspace

Spec: [post-workspace.md](../ux/components/widgets/post-workspace.md)

- [ ] PostMessageCard: copy, edit toolbar
- [ ] Inline edit: textarea, media, Save / Cancel
- [ ] PostCommentsPanel + CommentComposer (published/scheduled)
- [ ] PostCardToolbar icons
- [ ] Mode integration: chat / notes / chats / comments

### note-editor

Spec: [note-editor.md](../ux/components/widgets/note-editor.md)

- [ ] view / edit modes; title `useFitTitleSize`
- [ ] NoteHeaderToolbar: attach, preview, save, cancel (if changed)
- [ ] NoteBodyEditor: text + embed chips
- [ ] NoteFilesPanel: attach, remove, DnD source
- [ ] Save → repository; dirty → confirm on leave
- [ ] Embed DnD reorder (core) — OK
- [ ] Embed DnD edge cases (media↔text) — **optional**, не блокер gate

### analytics-dashboard + charts

Spec: [analytics-dashboard.md](../ux/components/widgets/analytics-dashboard.md), [charts.md](../ux/components/widgets/charts.md)

- [ ] ChannelAnalyticsSection: summary + trend chart
- [ ] Period switch: 5 periods (desktop in card, mobile in header)
- [ ] ChannelMetricBars, ChannelReactionsPanel
- [ ] Screen: AnalyticsHeatmap, AnalyticsTopPostsTable
- [ ] Open post from top posts table
- [ ] Удалён или подключён orphan `widgets/analytics/ui/analytics-period-filter.tsx`

### profile-settings

Spec: [profile-settings.md](../ux/components/widgets/profile-settings.md)

- [ ] Channel tab: core fields + rubrics, save, dirty
- [ ] Settings: Theme, User, AI models, System prompt, Telegram
- [ ] Platform analytics tab: charts + table
- [ ] Dirty confirm при смене таба / уходе
- [ ] Нет `window.confirm` на save/delete flows

---

## M4 — Features

DoD: сценарий работает через repository; e2e или manual happy path.

Логика может жить в widgets/store — **refactor в `features/` не блокер gate**.

| Feature | Checklist |
|---------|-----------|
| **post-context-menu** | [ ] draft: publish, schedule, delete · [ ] scheduled: publish, reschedule, cancel, delete · [ ] published: delete · [ ] always: new chat, new note |
| **schedule-post** | [ ] SchedulePickerModal opens · [ ] updates status + date |
| **manage-drafts** | [ ] DnD reorder persists in session · [ ] survives until reload |
| **send-message** | [ ] home/gchat/post send · [ ] stub AI reply (keywords) |
| **attach-post-mention** | [ ] `@` dropdown · [ ] chip remove |
| **attach-media** | [ ] per-scope attach menus |
| **inline-edit-post** | [ ] edit card · [ ] save patch to post |
| **publish-post** | [ ] draft → published via menu |
| **note-ai-flag** | [ ] toggle in note menu + notes catalog |
| **delete/rename chat** | [ ] gchat header, chats catalog, message menu |
| **delete/rename note** | [ ] note header, notes catalog |
| **edit-chat-message** | [ ] edit in place · [ ] stub after edit |
| **profile-save** | [ ] channel, AI, telegram, prompt blocks save |

---

## M4 — Screens

DoD на экран: [pages.md](../ux/pages.md) + wireframe + E2E smoke + `parity.md` → `done`.

### home — `/`

Wireframe: [01-home](../ux/wireframes/01-home.md)

- [ ] PageHeader brand button
- [ ] Intro + Composer scope home
- [ ] Send → new gchat + message visible
- [ ] Attach file (if applicable)
- [ ] `@` mention flow
- [ ] E2E: load + send → gchat
- [ ] **parity.md → done**

### gchat — `/gchat/?id=`

Wireframe: [05-global-chat](../ux/wireframes/05-global-chat.md)

- [ ] Breadcrumbs: Чаты / title
- [ ] Back → chats catalog
- [ ] Thread + composer scope gchat
- [ ] Delete chat (non-omnichannel)
- [ ] Edit user message + stub reply
- [ ] Legacy redirect `/gchat/gc1/` → `?id=gc1`
- [ ] E2E: load, back, redirect, delete
- [ ] **parity.md → done**

### feed — `/feed/`

Wireframe: [02-feed](../ux/wireframes/02-feed.md)

- [ ] Header: search + width toggle
- [ ] Sections: Опубликованные (by day), Отложенные, Черновики
- [ ] Click card → post chat mode
- [ ] Comments row click → post comments mode
- [ ] Composer → new draft in Черновики
- [ ] Draft DnD reorder
- [ ] Search filters cards
- [ ] E2E: nav, open post, draft create/reorder
- [ ] **parity.md → done**

### post — `/post/{id}/`

Wireframe: [03-post](../ux/wireframes/03-post.md)

- [ ] Breadcrumbs: Лента / title
- [ ] Tabs: ↑ К посту, Заметки, Чаты, ← Назад, •••
- [ ] **chat:** card + composer, inline edit, local chat create
- [ ] **notes:** FilterToolbar + list + new note + AI toggle
- [ ] **chats:** FilterToolbar + list + new chat
- [ ] **comments:** readonly card + list + CommentComposer
- [ ] Context menu by status (publish/schedule/delete)
- [ ] List search in notes/chats/comments modes
- [ ] Legacy redirect `/post/{id}/notes/` → canonical
- [ ] E2E: load, modes, edit, publish draft
- [ ] **parity.md → done**

### note — `/note/*`

Wireframe: [04-note](../ux/wireframes/04-note.md)

- [ ] Global breadcrumbs: Заметки / title
- [ ] Local breadcrumbs: Лента / post / title
- [ ] view / edit modes
- [ ] Save, dirty confirm, beforeunload
- [ ] Overflow: AI flag, delete, cancel (new)
- [ ] New note route `/note/new/`
- [ ] Attach files + embed in body
- [ ] E2E: load, edit title, save, dirty leave
- [ ] **parity.md → done**

### chats — `/chats/`

Wireframe: [06-chats](../ux/wireframes/06-chats.md)

- [ ] Scope: Все / Глобальные / Локальные
- [ ] Search
- [ ] Новый чат → home (Все/Глобальные)
- [ ] Open global → gchat; local → post
- [ ] Card menu delete
- [ ] E2E: back, scope select, open chat
- [ ] **parity.md → done** *(verify)*

### notes — `/notes/`

Wireframe: [07-notes](../ux/wireframes/07-notes.md)

- [ ] Scope + AI context filter
- [ ] Новая заметка
- [ ] Card: preview, meta, AI toggle, menu
- [ ] E2E: nav, filter interaction, new note
- [ ] **parity.md → done** *(verify)*

### analytics — `/analytics/`

Wireframe: [08-analytics](../ux/wireframes/08-analytics.md)

- [ ] 5 periods switch correctly
- [ ] Trend chart + series selector
- [ ] Metric bars + reactions
- [ ] Heatmap
- [ ] Top posts table → open post
- [ ] E2E: load + period switch
- [ ] **parity.md → done**

### profile — `/profile/`

Wireframe: [09-profile](../ux/wireframes/09-profile.md)

- [ ] Tabs: Канал / Настройки / Аналитика платформы
- [ ] Channel: all fields + rubrics, save
- [ ] Settings: theme, user, AI, prompt, Telegram (UI forms)
- [ ] Platform analytics: period + charts
- [ ] Dirty guard on tab switch
- [ ] E2E: tabs, save, dirty
- [ ] **parity.md → done**

---

## M5 — Local-first demo

DoD: demo полностью функционален без backend; [local-first.md](./local-first.md).

### Data layer

- [ ] MSW handlers cover all UI mutations used in scenario
- [ ] Seed inventory matches legacy (5 posts, 4 global notes, 2 gchats, profile, analytics)
- [ ] Stub AI: global keywords, post keywords, after-edit reply
- [ ] `npm run build` with `NEXT_PUBLIC_USE_MSW=1` succeeds

### CRUD matrix (через UI, session-only)

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Post draft | [ ] feed composer | [ ] feed/post | [ ] inline edit, schedule | [ ] ctx menu |
| Post publish | [ ] ctx menu | [ ] feed metrics | — | [ ] ctx menu |
| Global chat | [ ] home send | [ ] gchat/chats | [ ] rename, messages | [ ] delete |
| Global note | [ ] notes/new | [ ] note | [ ] edit, AI flag | [ ] delete |
| Local note | [ ] post→notes | [ ] note | [ ] edit | [ ] delete |
| Local chat | [ ] post ctx / filter | [ ] post chat | [ ] messages | [ ] via post |
| Profile channel | — | [ ] profile | [ ] save | — |
| Profile AI | — | [ ] profile | [ ] save models/prompt | — |
| Profile telegram | — | [ ] profile | [ ] save forms (UI) | — |

### Known limits (OK for M5)

- [ ] Documented: no persistence after page reload (except theme/sidebar)
- [ ] Documented: stub AI, not real LLM
- [ ] Documented: no real Telegram connection in demo
- [ ] Out of scope: agent «создай черновик» by command (Track B)

---

## Polish (обязательно до Pages)

Не полный M7 (tokens/Tailwind) — только demo-quality.

- [ ] `ErrorBoundary` in AppProviders
- [ ] MSW startup failure → user-visible state (not silent crash)
- [ ] All `window.confirm` → ConfirmDialog (delete, dirty leave, profile)
- [ ] All `window.alert` → toast or modal (composer LLM)
- [ ] Mutation `onError` / toast — no silent `void mutateAsync` failures
- [ ] No console errors on happy path (all 9 screens)
- [ ] Loading / empty / error states — no raw broken UI
- [ ] `← Назад` correct on every screen ([routing.md](./routing.md))

**Отложить на M7:** design tokens migration, full a11y audit, list virtualization, `next/dynamic` charts.

---

## Сценарный чеклист

Источник: [09-user-scenario.md](../product/09-user-scenario.md). Прогон **одним проходом**, отметить дату.

**Дата прогона:** _______________

### Акт 1 — Настройка

- [ ] Открытие `/` — seed-лента и профиль, не пустой экран
- [ ] Profile → Настройки → Telegram block (forms render, save UI)
- [ ] Profile → Настройки → добавить/редактировать LLM модель, save
- [ ] Profile → Настройки → системный промпт, save
- [ ] Profile → Канал → ЦА, рубрики (4), тон, избегать — save

### Акт 2 — Идея

- [ ] Лента → карточка published с 👁 и реакциями
- [ ] Заметки → Новая заметка → текст → save (без AI flag)
- [ ] Home → сообщение ИИ → stub reply
- [ ] Home/gchat → `@` post mention → chip → send
- [ ] Note → ••• → Учитывать в ИИ

### Акт 3 — Черновик поста

- [ ] Feed → composer → текст/медиа → ↑ → черновик в секции
- [ ] Click draft → post chat mode
- [ ] Post chat → attach media / file
- [ ] Post chat → сообщение ИИ → stub reply
- [ ] Post card → ✏ редактировать → save
- [ ] Черновик остаётся draft до явной публикации

### Акт 4 — Публикация

- [ ] Post → ••• → Опубликовать
- [ ] Feed → карточка в «Опубликованные» с метриками
- [ ] Post chat → вопрос локальному ИИ
- [ ] Заметки → новая глобальная заметка (обратная связь)

### Акт 5 — Стратегия

- [ ] Home/gchat → «Что сработало за неделю?» → stub reply
- [ ] Home/gchat → «План на следующую неделю…» → stub reply
- [ ] *(Optional / Track B)* «создай черновик» → новый post — **не блокер**

### Акт 6 — Контроль

- [ ] Profile → Аналитика платформы → графики + таблица
- [ ] Profile → Канал → правка «Избегать» → save

### Полный цикл (таблица из scenario)

- [ ] Telegram + ИИ-модели
- [ ] База знаний канала
- [ ] Идея в заметку
- [ ] Диалог с глобальным ИИ
- [ ] Черновик поста
- [ ] Работа над постом
- [ ] Публикация
- [ ] Аналитика канала
- [ ] Метрики ИИ

---

## Navigation flows

Источник: [flows.md](../ux/flows.md). Ручная проверка.

- [ ] **1.** Home → send → new gchat + AI stub
- [ ] **2.** Sidebar → feed → click card → post chat
- [ ] **3.** Post tabs: chat ↔ notes ↔ chats ↔ comments
- [ ] **4.** Post context menu by status (draft/scheduled/published)
- [ ] **5.** Feed draft DnD reorder (resets on reload — OK)
- [ ] **6.** Sidebar recents → note / chat / post
- [ ] **7.** Notes catalog → filter → open note
- [ ] **8.** Chats catalog → scope → open gchat / post
- [ ] **9.** Note dirty → back → confirm → discard or stay
- [ ] **10.** Profile dirty → tab switch → confirm
- [ ] **11.** Post inline edit → cancel / save
- [ ] **12.** Legacy URL redirects (gchat, post notes)

---

## E2E — critical path

Файл: [`e2e/shell.spec.ts`](../../e2e/shell.spec.ts). Добавить недостающие.

### Implemented

- [x] Home load
- [x] Home send → gchat
- [x] Sidebar → feed
- [x] Sidebar → notes
- [x] Chats back
- [x] Chats scope
- [x] Gchat back + legacy redirect
- [x] Analytics load
- [x] Post load + legacy redirect
- [x] Global note load

### To add (gate)

- [ ] Feed → open post
- [ ] Feed → create draft (composer)
- [ ] Feed → draft DnD (optional if flaky)
- [ ] Post → switch to Заметки / Чаты
- [ ] Post → publish draft via •••
- [ ] Post → inline edit save
- [ ] Note → edit + save
- [ ] Note → dirty leave confirm
- [ ] Gchat → delete chat
- [ ] Gchat → edit message (optional)
- [ ] Profile → tab switch
- [ ] Profile → dirty confirm
- [ ] Analytics → period switch
- [ ] Notes → AI filter tab click

---

## Вне scope до Pages

Не блокируют M6, если scenario проходит:

- [ ] Refactor embedded logic → `features/` slices
- [ ] `posts.getById` (M7 backend)
- [ ] Note embed DnD polish (edge cases)
- [ ] Tailwind / design tokens migration
- [ ] List virtualization
- [ ] Real Telegram / LLM / persistence
- [ ] Agent actions by natural language

---

## Sign-off

| Role | Name | Date | M3–M5 OK |
|------|------|------|----------|
| Dev | | | [ ] |
| Manual QA (scenario) | | | [ ] |
| `npm run check` | | | [ ] |

**После sign-off →** [deploy.md](./deploy.md) · M6 GitHub Pages workflow.
