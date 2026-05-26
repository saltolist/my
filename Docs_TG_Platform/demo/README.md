# TG Platform demo (Next.js + TypeScript)

Демо TG Platform — статическая витрина продукта без бэкенда. Открывается одной ссылкой на GitHub Pages, реальной интеграции с Telegram и LLM нет, ответы ИИ заскриптованы. Концепт демо — в [`../concept/12-demo.md`](../concept/12-demo.md).

## Стек

- Next.js 15 (App Router) + React 19 + TypeScript.
- Статический экспорт (`next.config.ts` → `output: "export"`).
- Один глобальный CSS-файл (`app/globals.css`) — стили перенесены целиком из предыдущей vanilla-версии.

## Запуск локально

```bash
cd Docs_TG_Platform/demo
npm install
npm run dev
# http://localhost:3000
```

## Сборка статики для GitHub Pages

```bash
npm run build
# готовый сайт лежит в out/
```

Если демо публикуется по подкаталогу (например, `https://<user>.github.io/<repo>/demo/`), передайте префикс при сборке:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo>/Docs_TG_Platform/demo npm run build
```

`next.config.ts` подхватит `basePath` и `assetPrefix` из переменной окружения.

## Маршруты (URL)

Каждый экран — отдельный путь (статический HTML в `out/` для GitHub Pages):

| URL | Экран |
|-----|--------|
| `/` | Главная |
| `/feed/` | Лента |
| `/chats/` | Чаты |
| `/notes/` | Заметки |
| `/analytics/` | Аналитика |
| `/profile/` | Профиль |
| `/gchat/?id=…` | Глобальный чат (id в query — любые чаты без prebuild) |
| `/post/[id]/` | Пост (режим чата; вкладки «Заметки»/«Чаты»/комментарии — в `postMode`, без смены URL) |
| `/note/global/[id]/` | Глобальная заметка |
| `/note/post/[postId]/[noteId]/` | Заметка поста |
| `/note/new/` | Новая заметка |

После сборки `scripts/copy-404.mjs` копирует `index.html` в `404.html` — fallback для неизвестных URL на GitHub Pages (новые посты с runtime-id и т.п.).

## Структура проекта

```
demo/
├── app/
│   ├── (shell)/             ← layout + страницы по маршрутам
│   ├── globals.css          ← все стили платформы (verbatim)
│   └── layout.tsx
├── components/
│   ├── AppShell.tsx         ← сайдбар + main + RouteSync
│   ├── ContextMenu.tsx      ← переиспользуемое меню «•••»
│   ├── PageHeader.tsx       ← единая шапка (заголовок/крошки + поиск + back + ••• справа)
│   ├── chat/
│   │   ├── ChatMessage.tsx       ← сообщения, ветки после редактирования
│   │   └── AiMessageToolbar.tsx  ← toolbar ответов ИИ
│   ├── composer/
│   │   ├── Composer.tsx     ← поле ввода с авто-ресайзом + ModelPicker’ы + AttachMenu
│   │   ├── AttachMenu.tsx   ← универсальное `+` меню (посты, медиа, файл) через portal
│   │   └── ModelPicker.tsx  ← пилюля выбора провайдера/модели с dropdown’ом через portal
│   ├── post/
│   │   ├── PostMediaBlock.tsx      ← TG-стиль медиа-блок
│   │   ├── PostCommentsPanel.tsx   ← режим comments
│   │   ├── PostCardCommentsSection.tsx
│   │   ├── PostCommentsRow.tsx
│   │   └── CommentComposer.tsx
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   ├── DraftsSection.tsx
│   │   └── PostEngagement.tsx      ← реакции, просмотры, репосты, 💬
│   ├── note/
│   │   └── NoteFilesPanel.tsx   ← вложения заметки
│   ├── profile/
│   │   ├── ChannelTab.tsx
│   │   ├── AiModelsBlock.tsx
│   │   ├── SystemPromptBlock.tsx
│   │   ├── TelegramBlock.tsx
│   │   └── ThemeBlock.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── GlobalChatScreen.tsx
│   │   ├── FeedScreen.tsx
│   │   ├── PostScreen.tsx
│   │   ├── NoteScreen.tsx
│   │   ├── ChatsScreen.tsx
│   │   ├── NotesScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── sidebar/
│       ├── Sidebar.tsx
│       └── MobileTopbar.tsx
├── lib/
│   ├── types.ts             ← TS-типы Post / Note / Chat / Config / ComposerAttachment / PostMedia
│   ├── data.ts              ← мок-данные на старте (включая SVG-превью медиа)
│   ├── replies.ts           ← заскриптованные ответы ИИ
│   ├── composer-config.ts   ← провайдеры/модели LLM и Web Search
│   ├── helpers.ts           ← autoResize (с maxLines), readFileAsMedia, isImage/isVideo и т. п.
│   ├── chatPaths.ts         ← ветки сообщений, заглушка после правки
│   ├── postComments.ts      ← фильтрация комментариев
│   ├── noteDraft.ts / noteEmbeds.ts
│   └── use-fit-title.ts     ← хук авто-подгонки шрифта заголовка под одну строку
├── state/
│   └── AppContext.tsx       ← единый useReducer + actions через useApp()
├── next.config.ts
├── package.json
├── tsconfig.json
└── .gitignore
```

## Модель данных

Вся изменяемая модель платформы живёт в одном `useReducer` в `state/AppContext.tsx`:

- `posts` (включая `media`, `chats`, `comments`, `metrics.reactions`), `globalChats`, `globalNotes`, `aiProfileConfig`, `telegramProfileConfig` — мок-сущности;
- `screen`, `currentPostId`, `currentPostChatId`, `currentGChatId`, `currentNote`, `postMode` (`chat` / `chats` / `notes` / `comments`), `postViewStack` (стек переходов внутри пространства поста), `noteMode`, и т. п. — UI-состояние;
- `composerTargets` — выбор LLM/Web Search модели на каждой точке отправки (`home`, `gchat`, `post`).

Вложения сообщений (`ComposerAttachment` — пост, файл, медиа) живут локально внутри `Composer.tsx` и попадают в текст сообщения при отправке. `PostMedia` (data URL + тип) — общая структура для медиа поста и для медиа, которые пользователь добавляет в черновик/редактирует в `PostScreen`.

Состояние полностью in-memory: перезагрузка вкладки возвращает демо к начальному состоянию.

## Что работает в демо

- **сайдбар**: `Глобальный чат`, `Лента`, `Аналитика`, `Заметки` ▾, `Чаты` ▾, `Профиль`; недавние списки под заметками и чатами; сворачиваемый rail на десктопе (`localStorage`);
- **лента**: три секции, TG-стиль медиа, пилюли реакций + `👁`/`↗`/`💬` у опубликованных, поиск, переключатель ширины карточек (`500`/`390`/`270` px), drag-and-drop черновиков (рель с тремя точками, автоскролл у краёв), composer для нового черновика;
- **пространство поста**: режимы `chat` / `chats` / `notes` / `comments`; шапка с кластерами `Заметки`/`Чаты` и `+ Новая заметка` / `+ Новый чат`; крошки до трёх уровней; поиск в подрежимах; комментарии с ответами; inline-редактирование поста; множественные локальные чаты; стек `← Назад`;
- **глобальный чат**: создание с `home`, мультиответ, редактирование сообщений с ветками, `AiMessageToolbar`;
- **composer** (общий): выбор LLM-модели и Web Search-модели через `ModelPicker` (пилюля с иконкой + dropdown через portal), флаг `Мультиответ`, авто-ресайз textarea (до 10 строк на `home`, до 16 в чатах и ленте);
- **attach-меню `+`** (универсальное, `AttachMenu`): на `home`/`gchat` — `Прикрепить пост` / `Медиа из прикреплённых постов` / `Прикрепить файл с компьютера`; на `post` — `Прикрепить пост` / `Медиа из поста` / `Прикрепить файл с компьютера` / `Медиа из прикреплённых постов`; в `feed` — сразу file picker. Медиа в подменю — миниатюры 72×72 с адаптивной сеткой (1–3 в ряд, 4 в 2×2, 5+ в три колонки со скроллом). В composer’е поддерживается inline-чип в `contenteditable` через синтаксис `@<title>;`;
- **единая шапка** (`PageHeader`) в стиле liquid glass: крошки/заголовок слева, поиск и вкладки по центру, `← Назад` (на верхнеуровневых экранах → `home`) / `↑ К посту` / режимы / `•••` справа;
- **тема оформления**: сегментированный переключатель `☀ Светлая` / `🖥 Системная` / `🌙 Тёмная` на вкладке `Настройки`, выбор сохраняется в `localStorage` (атрибут `data-theme` на `<html>`);
- **профиль** (заголовок `Профиль канала`, вкладки в шапке: `Настройки` → `Канал` → `Аналитика платформы`, старт — `Канал`):
  - вкладка `Канал` — редактируемая модель профиля: ЦА, рубрики, тон, структура, запреты, бренд-бук, конкуренты и референсы;
  - вкладка `Настройки` — переключатель темы, несколько LLM/Web Search моделей с флагом «Включить в мультиответ», `ModelPicker` для провайдера/модели и `syncMode`, системный промпт и API-ключи в полях с явными рамками, MTProto-форма Telegram (api_id, api_hash, телефон, код, sessionName, подключение канала);
  - вкладка `Аналитика платформы` — мок-метрики использования ИИ;
- **заметки**: каталог с поиском в шапке, scope `Все/Глобальные/Локальные`, фильтр `Все / В контексте ИИ / Не в контексте`, AI-флаг у глобальных и локальных, drag-and-drop файлов/embed в теле заметки, удаление, переход к посту, кнопка `+ Новая заметка` (scope `Все` и `Глобальные`); крошки локальной заметки: `Лента / пост / название`;
- **чаты**: вкладки `Все/Глобальные/Локальные` (по карточке на каждый локальный чат), поиск в шапке, переходы в конкретный глобальный чат или в локальный чат внутри пространства поста;
- **аналитика канала**: статичные периоды/карточки/таблица лучших постов.

## Заскриптованные ответы ИИ

`lib/replies.ts` — ответы по ключевым словам в тексте сообщения:

- `getGlobalReply(text)` — `контент-план`, `рубрик`, `тем`, `охват`; иначе нейтральный уточняющий ответ.
- `getPostReply(text)` — `перепиш`/`rewrite`, `заголов`, `почему`/`аналити`; иначе общий уточняющий ответ.

После редактирования пользовательского сообщения — `STUB_REPLY_AFTER_USER_EDIT` из `lib/chatPaths.ts`. Подробнее — [`concept/12-demo.md`](../concept/12-demo.md).
