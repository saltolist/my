# Структура страниц (web-клиент)

Документ описывает страницы reference-клиента [`web-legacy`](../../../web-legacy/). Детали layout — в [wireframes/](./wireframes/); каталог компонентов — в [components/](./components/).

**Reference code:** `web-legacy/src/screens/`, `web-legacy/src/widgets/`

---

## Навигация (левая панель)

Постоянна на всех экранах. На узкой ширине — mobile topbar и выдвижная панель.

**Компоненты:** [`Sidebar`](./components/widgets/sidebar.md), [`AppShell`](./components/widgets/app-shell.md)

### Бренд и сворачивание

- `✦ TG Platform` → `home`.
- На ширине ≥761px: **отдельная кнопка** rail в `SidebarHeader` сворачивает панель в узкий rail (только иконки). Состояние в `localStorage` (`tg-platform-sidebar-collapsed`).
- Клик по логотипу **не** сворачивает панель — только переход на `home`.

### Пункты (сверху вниз)

| Пункт | Экран | Дополнительно |
|---|---|---|
| `Глобальный чат` | `home` | иконка `+`; активен на `screen === home` |
| `Аналитика` | `analytics` | |
| `Лента` | `feed` | |
| *(строка поста)* | `post` | если открыт пост — `SidebarFeedPostRow` с context menu |
| `Заметки` | `notes` | chevron ▾ — недавние (до 14) |
| `Чаты` | `chats` | chevron ▾ — недавние |
| `Профиль` | `profile` | внизу панели |

### Недавние списки

- сортировка по активности;
- смешанный список глобальных и локальных элементов;
- в пространстве поста — секции **Этот пост** и **Остальные**;
- клик открывает заметку или чат; у строки — меню `⋯`.

---

## Общая шапка (`PageHeader`)

**Компонент:** [`PageHeader`](./components/widgets/page-header.md)

На всех экранах — единая шапка фиксированной высоты:

- слева — заголовок, хлебные крошки или `PageHeaderMenuButton` (hamburger на mobile/gchat);
- по центре — опциональный поиск и/или dropdown scope/period;
- справа — `← Назад`, дополнительные действия, overflow-меню.

На `post` — класс `page-header--post`, контент скроллится под шапкой.

**Scope-фильтры** на `chats` / `notes`: на desktop — `PageHeaderSelect` (dropdown), не tab-кнопки. На mobile — select в шапке.

---

## Composer (поле ввода)

**Компонент:** [`Composer`](./components/widgets/composer.md)

Одинаков по конструкции на `home`, `gchat` и `post` (`chat`). Отличия — scope attach-меню и maxLines.

### Строка управления

- `+` — attach-меню;
- пилюли LLM (`🧠`) и Web Search (`🔎`) через `ModelPicker`;
- pill `Мультиответ` (если в профиле включено у нескольких моделей);
- `↑` — отправить.

### Авто-ресайз

| Scope | Max lines | Направление attach-меню |
|---|---|---|
| `home` | 10 | вниз |
| `gchat`, `post`, `feed` | 16 | вверх (composer у низа) |

### Прикрепление постов

- **Через `@` mention** (`ComposerMentionDropdown`), не через пункт attach-меню на `home`/`gchat`.
- Синтаксис `@<title>;` → чип-пост над textarea.
- Чипы удаляются крестиком или Backspace при пустом поле.

### Attach-меню по scope

| Scope | Пункты |
|---|---|
| `home` | `Прикрепить файл`, `Медиа из прикреплённых постов` (если есть привязанные посты с медиа) |
| `gchat` | то же |
| `post` | `Медиа из поста`, `Медиа из прикреплённых постов`, `Загрузить с компьютера` |
| `feed` | `+` сразу открывает file picker (без меню) |

Медиа в подменю — миниатюры 72×72, адаптивная сетка со скроллом.

Placeholder: `Сообщение... введите @ чтобы прикрепить пост`.

---

## Сообщения в чатах

**Компоненты:** [`ChatThread`](./components/widgets/chat-thread.md)

- ответы ИИ: одиночный или мультиответ; `AiMessageToolbar`;
- пользовательские: редактирование по hover, ветки `userBranches`, `ChatBranchNav`;
- после правки — stub `STUB_REPLY_AFTER_USER_EDIT`.

---

## 1. `home`

**Reference:** `screens/home/ui/HomePage.tsx` · [wireframe](./wireframes/01-home.md)

**Элементы:**

- `PageHeader` с кнопкой-брендом `TG Platform`;
- `✦` + заголовок `Чем помочь сегодня?`;
- `Composer scope="home"`.

**Поведение:** отправка → новый глобальный чат → `gchat`.

---

## 2. `gchat`

**Reference:** `screens/gchat/` · [wireframe](./wireframes/05-global-chat.md)

**Шапка:** hamburger + `Чаты / Название чата`; `← Назад` → каталог чатов; меню `Удалить чат` (скрыто для omnichannel).

**Тело:** история + composer (`scope="gchat"`).

---

## 3. `feed`

**Reference:** `screens/feed/` · [wireframe](./wireframes/02-feed.md)

**Шапка:** `Лента`; поиск + переключатель ширины **Компьютер / Планшет / Телефон** (500/390/270 px); `← Назад` → `home`.

**Структура:**

- секции `Опубликованные` (с **группами по дням**), `Отложенные`, `Черновики`;
- карточка: медиа, текст, SVG-статус (✓/◷/✎), реакции + просмотры/репосты в footer, **`PostCommentsRow`** отдельной строкой;
- **рубрика на карточке не показывается**;
- composer внизу (`scope="feed"`).

**Черновики:** drag-handle — **6-точечная** рель слева; порядок in-memory до перезагрузки.

---

## 4. `post`

**Reference:** `screens/post/`, `widgets/post-workspace/` · [wireframe](./wireframes/03-post.md)

**Шапка:** крошки `Лента / …`; `↑ К посту`, `Заметки`, `Чаты`, `← Назад`, `•••`. Поиск в режимах `notes`/`chats`/`comments`.

**`← Назад`:** `router.back()` / parent path — **не** внутренний `postViewStack`.

**`+ Новая заметка` / `+ Новый чат`:** в [`FilterToolbar`](./components/widgets/filter-toolbar.md) под шапкой, не в header cluster.

### Меню `•••`

Общее: `Новый чат`, `Новая заметка`.

| Статус | Дополнительно |
|---|---|
| Черновик | `Опубликовать`, `Запланировать`, `Удалить` |
| Отложенный | `Опубликовать`, `Перенести публикацию`, `Отменить публикацию`, `Удалить` |
| Опубликованный | `Удалить` |

### Режим `chat`

- карточка поста + `PostCardToolbar` (иконки **копировать** и **редактировать**);
- inline-edit: иконка «Прикрепить файл», кнопки `Сохранить` / `Отмена`;
- первое сообщение создаёт локальный чат;
- composer `scope="post"`.

### Режим `chats` / `notes`

- `FilterToolbar`: фильтр `Все / В контексте ИИ / Не в контексте` + action-кнопка;
- AI-флаг на карточках: **«В контексте» / «Не в контексте»** (`NoteCardAiToggle`).

### Режим `comments`

- readonly карточка + список + `CommentComposer`.

---

## 5. `note`

**Reference:** `screens/note/` · [wireframe](./wireframes/04-note.md)

**Шапка:** крошки (глобальная или локальная); overflow-меню с AI-флагом и удалением.

**Режимы `view` / `edit`:** заголовок — textarea (`useFitTitleSize`); в view заголовок технически редактируем.

- **Нет** метки `📌 Локальная` / `→ пост` в теле (только в breadcrumbs).
- `Отменить` в edit-toolbar — только при `changed`.
- DnD embed-чипов и файлов — см. [`NoteEditor`](./components/widgets/note-editor.md).

---

## 6. `chats`

**Reference:** `screens/chats/` · [wireframe](./wireframes/06-chats.md)

**Шапка:** `Чаты`; поиск + dropdown `Все / Глобальные / Локальные`; `← Назад` → `home`.

**Список:**

- на `Все`/`Глобальные` — кнопка **`Новый чат`** → `home`;
- карточки с icon rail (💬/✈ для global, 📄 для local);
- **нет кнопки `→ пост`** — переход к посту через клик по локальной карточке;
- удаление — context menu.

---

## 7. `notes`

**Reference:** `screens/notes/` · [wireframe](./wireframes/07-notes.md)

**Шапка:** `Заметки`; поиск + dropdown scope; `← Назад` → `home`.

**FilterToolbar:** `Все / В контексте ИИ / Не в контексте` + `+ Новая заметка`.

**Карточка:** заголовок, превью, AI-toggle, мета `{дата} · Глобальная|Локальная`. **Нет `→ пост`** на карточке.

---

## 8. `analytics`

**Reference:** `screens/analytics/` · [wireframe](./wireframes/08-analytics.md)

**Шапка:** `Аналитика канала`; период на mobile — в шапке; на desktop — внутри карточки «Динамика прироста».

**Периоды (5):** `24 часа`, `7 дней`, `30 дней`, `90 дней`, `Всё время`.

**Блоки** (полный набор экрана):

1. `ChannelAnalyticsSection` — summary metrics + `MultiSeriesTrendChart` + selector серий
2. `ChannelMetricBars` — «Прирост по метрикам»
3. `ChannelReactionsPanel` — «Реакции»
4. `AnalyticsHeatmap` — тепловая карта
5. `AnalyticsTopPostsTable` — лучшие посты

---

## 9. `profile`

**Reference:** `screens/profile/` · [wireframe](./wireframes/09-profile.md)

**Вкладки:** `Настройки` | `Канал` | `Аналитика платформы`. **Стартовая: `Настройки`.**

Confirm при уходе с dirty-state с вкладок `Настройки` и `Канал`.

### `Канал`

Форма базы знаний: ядро канала, голос и формат, правила, рубрики (название + описание). Описание полей — [05-channel-profile.md](../product/05-channel-profile.md); UI-структура — [profile-settings.md](./components/widgets/profile-settings.md#channeltab).

### `Настройки`

- **Тема** — `☀ Светлая` / `🖥 Системная` / `🌙 Тёмная`
- **ИИ-движок** — LLM, Web Search, Оркестратор, Web Reasoner, RAG Reasoner + системный промпт + мультиответ
- **Telegram** — MTProto + **Омниканальный бот**; `sessionName` / `syncMode` — в seed/types, **не рендерятся** в форме

### `Аналитика платформы`

`PlatformModelsChartSection`, `PlatformModelUsageSection`, `PlatformActivitySection` — графики моделей, использование, активность (чаты, заметки, посты).

---

## Карта экранов

| URL | Screen | Wireframe |
|---|---|---|
| `/` | `home` | [01-home](./wireframes/01-home.md) |
| `/gchat/?id=` | `gchat` | [05-global-chat](./wireframes/05-global-chat.md) |
| `/feed/` | `feed` | [02-feed](./wireframes/02-feed.md) |
| `/post/{id}/` | `post` | [03-post](./wireframes/03-post.md) |
| `/note/global/{id}/` | `note` | [04-note](./wireframes/04-note.md) |
| `/note/post/{postId}/{noteId}/` | `note` | [04-note](./wireframes/04-note.md) |
| `/chats/` | `chats` | [06-chats](./wireframes/06-chats.md) |
| `/notes/` | `notes` | [07-notes](./wireframes/07-notes.md) |
| `/analytics/` | `analytics` | [08-analytics](./wireframes/08-analytics.md) |
| `/profile/` | `profile` | [09-profile](./wireframes/09-profile.md) |
