# План исправлений: mobile UX + черновики

Сводный план багов и UX-регрессий, выявленных после деплоя GitHub Pages demo.  
**Legacy (`web-legacy`)** — ориентир для композера, backdrop и scroll; полный parity не цель.

**Статус:** в работе (P0–P2 реализованы в коде, 2026-06-14).

---

## Сводка проблем

| # | Проблема | Приоритет | Платформа |
|---|----------|-----------|-----------|
| 1 | Черновик: нельзя нормально открыть; пустая страница с композером | **P0** | all |
| 2 | Zoom экрана при фокусе в input | **P1** | mobile |
| 3 | Разная ширина AI-композеров | **P1** | mobile |
| 4 | Scrollbar уходит под frosted-backdrop композера | **P1** | mobile |
| 5 | Переключатель темы выходит за блок «Тема» | **P2** | Android |
| 6 | Полоса между постом и комментариями больше карточки | **P2** | mobile |

---

## Порядок работ

```
Фаза 1   P0  Черновики
Фаза 2   P1  Композеры (эталон — лента) + scrollbar/backdrop + zoom
Фаза 3   P2  Тема (Android) + полоса post↔comments
```

**Оценка:** P0 ~0.5–1 д · P1 ~1 д · P2 ~0.5 д + QA на реальных устройствах.

---

## P0 — Черновик: переход и пустая страница

### Симптом

После создания черновика в ленте переход на него не работает или открывается экран поста без контента — только композер внизу.

### Вероятные причины

1. **Race при создании** — `useCreatePost` инвалидирует список, но не делает optimistic update; при быстром клике `usePost(id)` не находит пост в cache.
2. **Пустой экран draft** — `PostChatView` рендерит карточку, но без чата; большой `--composer-overlay-h: 168px` создаёт пустую прокручиваемую зону → визуально «пусто + композер».
3. **DnD черновиков** — `useDraftsSection` / touch-события могут перехватывать клик по карточке на mobile.
4. **DnD черновиков** — `useDraftsSection` / touch-события могут перехватывать клик по карточке на mobile.

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| 0.1 | Воспроизвести: feed → создать draft → клик по карточке; проверить MSW, Network, React Query cache | manual, live demo |
| 0.2 | Optimistic update в `useCreatePost`: добавить пост в list + detail cache до refetch | `entities/post/model/usePosts.ts` |
| 0.3 | При открытии поста сбрасывать `isEditing: false` | `useFeedScreen.tsx` |
| 0.4 | Placeholder для пустого draft в `PostMessageCard` (без auto-edit) | `PostMessageCard.tsx` |
| 0.5 | Уменьшить `--composer-overlay-h` на mobile, если нет сообщений чата | `app/styles/tokens.css`, `shell-post.css` |
| 0.6 | Touch vs drag: `touch-action`, клик только по телу карточки; на ≤430px handle уже скрыт | `features/manage-drafts/`, `PostCard.tsx` |
| 0.7 | E2E: «создать draft → открыть → виден текст / режим редактирования» | `e2e/shell.spec.ts` |

### Критерии готовности

- [x] Создал draft с текстом → открыл → вижу текст в режиме просмотра (не auto-edit)
- [x] Нет «пустого» экрана без карточки поста
- [x] E2E green

---

## P1 — Единая ширина композеров

### Симптом

На mobile AI-композеры на post / gchat / home визуально уже или шире, чем в ленте.

### Принцип

**Эталон — композер ленты** (`#screen-feed .input-wrap` + `.input-box`).  
Post, gchat, home, comment-composer **повторяют** его геометрию, не задают свою.

### Текущий разнобой

| Место | Сейчас |
|-------|--------|
| Feed mobile | `padding: 12px` (`shell-feed-body.css`) |
| Post / gchat mobile | `padding: 14px var(--composer-mobile-gutter)` (gutter 8px) |
| Post body | лишний inset `.post-body-inner` +12px |
| Карточки | `--feed-post-w` из localStorage может ≠ `--composer-w` |

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| 1.1 | Зафиксировать **feed composer spec** как CSS-переменные: `--composer-gutter-inline`, `--composer-col-w`, `--input-wrap-pad-*` | `shell-feed-body.css`, `tokens.css` |
| 1.2 | Mobile: `--composer-col-w: calc(100% - 2 * var(--composer-gutter-inline))` — как `.input-box` в ленте | `shell-mobile.css` |
| 1.3 | Post / gchat / home / comment-composer: скопировать padding и width с feed; убрать локальные overrides | `shell-post.css`, `shell-gchat.css`, `shell-composer.css` |
| 1.4 | Убрать двойной padding `#screen-post .post-body-inner` на mobile | `shell-post.css` |
| 1.5 | `--feed-post-w` на mobile = `--composer-col-w`; localStorage width игнорировать при ≤760px | `useFeedPostLayout.ts`, CSS |
| 1.6 | Visual QA: feed → post → gchat → home — композеры совпадают pixel-perfect | manual |

### Критерии готовности

- [x] Все композеры одной ширины; эталон — лента
- [x] Карточки постов на mobile той же колонки, что композер

---

## P1 — Scrollbar и composer-backdrop

### Симптом

На mobile полоса прокрутки уходит под frosted-панель за композером. В legacy проблемы нет.

### Ожидаемое поведение (legacy parity)

- `.composer-backdrop` **строго = ширина `.input-box`**, по центру
- размытие по **левому и правому** краю (`::before` + `filter: blur`)
- scrollbar **виден** и не перекрывается backdrop

### Вероятная причина

- Scroll-контейнер (`.feed-scroll`, `.post-body`, `.gchat-messages`) — **на всю ширину viewport**
- Backdrop / input-box — уже (с gutter)
- Scrollbar рисуется у правого края экрана → thumb «прячется» под панелью

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| 1.7 | Сверить с **web-legacy**: `#screen-feed .composer-backdrop`, `.feed-scroll`, `@media 760px` | `web-legacy/feed.css`, `post.css`, `globals.css` |
| 1.8 | Backdrop привязать к `.input-box`: `width: 100%` внутри `.input-wrap` | `shell-feed-body.css`, `shell-post.css`, `shell-gchat.css` |
| 1.9 | Scroll-колонка = `--composer-col-w` по центру (как `.feed-inner`); scrollbar у правого края **колонки**, не viewport | scroll-body в feed / post / gchat |
| 1.10 | При необходимости: `padding-right` у scroll-body = gutter + `var(--sb-w)` | те же |
| 1.11 | QA: iOS Safari + Android Chrome — scroll до низа, thumb виден, backdrop = композер, blur по бокам | manual |

### Критерии готовности

- [x] Scrollbar не исчезает под frosted-панелью (узкая scroll-колонка = `--composer-col-w`)
- [x] Backdrop и input-box одной ширины с blur по бокам (`left/right: 0` в `.input-wrap`)

---

## P1 — Zoom при фокусе в input

### Симптом

На mobile при тапе в любое поле ввода экран зумится.

### Причина

`font-size: 14px` у `.input-box textarea`, `.composer-editor`, `.post-msg-textarea` и др. — iOS/Android зумят при **< 16px**.

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| 1.12 | `@media (max-width: 760px)`: `font-size: 16px` на всех editable полях | `shell-composer.css`, `shell-post.css`, `shell-profile-page.css`, `shell-notes.css` |
| 1.13 | Profile / telegram inputs, search в header, note editor | те же + `shell-mobile.css` |
| 1.14 | Placeholder можно оставить 14px через `::placeholder` (legacy-паттерн) | по необходимости |
| 1.15 | **Не** использовать `maximum-scale=1` в viewport — хуже для a11y | — |

### Критерии готовности

- [x] Фокус в input на iPhone / Android без zoom страницы (`font-size: 16px` на mobile)

---

## P2 — Тема на Android

### Симптом

Переключатель «Светлая / Системная / Тёмная» выходит за `.profile-section`. На iPhone — ок.

### Вероятная причина

| Фактор | Android | iOS |
|--------|---------|-----|
| Emoji-шрифт | Noto Color Emoji — шире | Apple Color Emoji — компактнее |
| `🖥️` | часто 2 glyph-width (base + VS16) | уже |
| Layout | `.theme-switch` = `inline-flex`, без `max-width: 100%` | суммарная ширина ещё влезает |
| Кнопки | `padding: 8px 14px` + icon + «Системная» | на узком экране ok |

### Стратегия

**Сначала диагностика → минимальный fix.** Не ломать iOS.

#### Шаг 0 — Диагностика

| # | Действие |
|---|----------|
| 2.1 | Android Chrome DevTools → computed width `.theme-switch` vs `.profile-section` |
| 2.2 | Сравнить с iPhone того же viewport (390px) |
| 2.3 | Какая кнопка вылезает (вероятно «Системная» + 🖥️) |
| 2.4 | В DevTools скрыть `.theme-switch-icon` — если влезает, причина = emoji metrics |

#### Путь A — CSS, emoji остаются (попробовать первым)

| # | Задача |
|---|--------|
| 2.5 | `.theme-switch { width: 100%; max-width: 100%; }` |
| 2.6 | `.theme-switch-btn { flex: 1 1 0; min-width: 0; padding: 8px 10px; font-size: 12px; }` |
| 2.7 | `.theme-switch-icon { flex-shrink: 0; width: 1em; overflow: hidden; }` |
| 2.8 | На ≤360px: короткий label «Системная» → «Авто» (CSS или JSX) |

#### Путь B — Скрыть emoji на всём mobile (простой fallback)

```css
@media (max-width: 760px) {
  .theme-switch-icon { display: none; }
}
```

`title` / `aria-checked` сохраняют a11y. iPhone тоже без emoji — визуально некритично.

#### Путь C — Скрыть emoji только на Android

| # | Задача | Файлы |
|---|--------|-------|
| 2.9 | Mount: UA → `html[data-platform="android"]` (hydration-safe, `useEffect`) | `ThemeBlock.tsx` или `AppShell` |
| 2.10 | `html[data-platform="android"] .theme-switch-icon { display: none; }` | `shell-profile-page.css` |

#### Путь D — Долгосрочно: SVG вместо emoji

Lucide / inline SVG 14×14 — одинаковая ширина на всех платформах. Отложить, если A/B/C достаточно.

### Рекомендуемый порядок

```
Диагностика → Путь A → если не хватает: C (Android-only) или B (весь mobile)
```

### Критерии готовности

- [x] `.theme-switch` не выходит за `.profile-section` на Android 360px (flex + path A)
- [x] iPhone: emoji на месте; Android: emoji скрыты (`data-platform-android`)
- [x] Выбор темы работает

---

## P2 — Полоса между постом и комментариями

### Симптом

На mobile зазор между постом и блоком комментариев визуально больше самой карточки поста.

### Контекст (уточнить при реализации)

Возможные места:

1. **Лента** — `.post-comments-row` (margin-top 14px, padding-top 12px, negative horizontal margin)
2. **Экран поста** — пустота между `PostMessageCard` и чатом из-за `--composer-overlay-h` + `gap: 12px`
3. **Черновики** — застрявший `.draft-drop-gap` (height до 120px) после DnD

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| 2.11 | Уточнить контекст по скриншоту (лента / post / drafts) | — |
| 2.12 | Mobile override `.post-comments-row`: меньше margin/padding | `shell-feed-body.css` |
| 2.13 | Адаптивный `--composer-overlay-h` на mobile | `tokens.css`, `shell-post.css` |
| 2.14 | Сброс `dropBeforeId` / `gapHeight` в `onDragEnd` — gap только во время drag | `useDraftsSection.ts` |

### Критерии готовности

- [x] Зазор post ↔ comments уменьшен на mobile (`margin/padding` 8px)
- [x] `--composer-overlay-h` 130px на mobile

---

## Общие критерии готовности (release checklist)

- [x] P0: draft create → open → контент виден
- [x] P1: композеры одной ширины (эталон — лента)
- [x] P1: scrollbar не под backdrop; backdrop = композер, blur по бокам
- [x] P1: нет zoom при фокусе в input
- [x] P2: тема не вылезает за блок на Android
- [x] P2: нормальный зазор post ↔ comments (CSS)
- [x] `npm run check` green
- [ ] Smoke на live demo
- [ ] Manual QA: iPhone Safari + Android Chrome

---

## Связанные документы

- [github-pages-architecture.md](./github-pages-architecture.md) — P0 Pages deploy (done), P1 backlog
- [pre-pages-execution-plan.md](./pre-pages-execution-plan.md) — исторический план
- [testing.md](./testing.md) — CI и E2E
- Legacy reference: `Docs_TG_Platform/web-legacy/src/app/styles/feed.css`, `post.css`, `globals.css`

---

## История

| Дата | Изменение |
|------|-----------|
| 2026-06-14 | Реализация P0–P2 в коде; E2E 18/18 |
| 2026-06-13 | Первый черновик плана по итогам QA demo на GitHub Pages |
