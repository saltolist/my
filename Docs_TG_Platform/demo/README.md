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

## Структура проекта

```
demo/
├── app/
│   ├── globals.css          ← все стили платформы (verbatim)
│   ├── layout.tsx
│   └── page.tsx             ← рендерит <App />
├── components/
│   ├── App.tsx              ← shell + переключение экранов
│   ├── ContextMenu.tsx      ← переиспользуемое меню «•••»
│   ├── PageHeader.tsx       ← единая шапка (заголовок/крошки + поиск + back + ••• справа)
│   ├── chat/
│   │   └── ChatMessage.tsx  ← одиночные и multi-response сообщения ИИ
│   ├── composer/
│   │   ├── Composer.tsx     ← поле ввода с авто-ресайзом + ModelPicker’ы + AttachMenu
│   │   ├── AttachMenu.tsx   ← универсальное `+` меню (посты, медиа, файл) через portal
│   │   └── ModelPicker.tsx  ← пилюля выбора провайдера/модели с dropdown’ом через portal
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   └── DraftsSection.tsx ← drag-and-drop черновиков
│   ├── post/
│   │   └── PostMediaBlock.tsx ← TG-стиль медиа-блок (превью, документы)
│   ├── profile/
│   │   ├── ChannelTab.tsx
│   │   ├── AiModelsBlock.tsx
│   │   ├── SystemPromptBlock.tsx
│   │   └── TelegramBlock.tsx
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

- `posts` (включая `media: PostMedia[]`), `globalChats`, `globalNotes`, `aiProfileConfig`, `telegramProfileConfig` — мок-сущности;
- `screen`, `currentPostId`, `currentGChatId`, `currentNote`, `postMode`, `noteMode`, и т. п. — UI-состояние;
- `composerTargets` — выбор LLM/Web Search модели на каждой точке отправки (`home`, `gchat`, `post`).

Вложения сообщений (`ComposerAttachment` — пост, файл, медиа) живут локально внутри `Composer.tsx` и попадают в текст сообщения при отправке. `PostMedia` (data URL + тип) — общая структура для медиа поста и для медиа, которые пользователь добавляет в черновик/редактирует в `PostScreen`.

Состояние полностью in-memory: перезагрузка вкладки возвращает демо к начальному состоянию.

## Что работает в демо

- **лента**: три секции (`Опубликованные`, `Отложенные`, `Черновики`), TG-стиль медиа-блок над текстом карточек, поиск по постам в шапке, drag-and-drop черновиков (ручка `⠿`, индикатор места вставки), создание черновика через нижний composer с прикреплением нескольких медиа сразу;
- **пространство поста**: чат с локальным ИИ; первое сообщение — карточка поста с медиа сверху; inline-редактирование (textarea авто-ресайзится от исходного размера, медиа остаётся сверху, кнопка `🖼 Добавить медиа`); переключение в режим заметок;
- **глобальный чат**: создание нового чата с `home`, продолжение существующего, удаление; история сообщений с поддержкой мультиответа;
- **composer** (общий): выбор LLM-модели и Web Search-модели через `ModelPicker` (пилюля с иконкой + dropdown через portal), флаг `Мультиответ`, авто-ресайз textarea (до 10 строк на `home`, до 16 в чатах и ленте);
- **attach-меню `+`** (универсальное, `AttachMenu`): на `home`/`gchat` — `Прикрепить пост` / `Медиа из прикреплённых постов` / `Прикрепить файл с компьютера`; на `post` — `Прикрепить пост` / `Медиа из поста` / `Прикрепить файл с компьютера` / `Медиа из прикреплённых постов`; в `feed` — сразу file picker. Медиа в подменю — миниатюры 72×72 с адаптивной сеткой (1–3 в ряд, 4 в 2×2, 5+ в три колонки со скроллом);
- **единая шапка** (`PageHeader`): заголовок или хлебные крошки слева, опциональный поиск по центру (на `feed` — выровнен по колонке постов), `← Назад` и `•••` справа;
- **профиль**:
  - вкладка `Канал` — статичная (демо-профиль);
  - вкладка `Настройки` — несколько LLM/Web Search моделей с флагом «Включить в мультиответ», `ModelPicker` для провайдера/модели и `syncMode`, системный промпт и API-ключи в полях с явными рамками, MTProto-форма Telegram (api_id, api_hash, телефон, код, sessionName, подключение канала);
  - вкладка `Аналитика платформы` — мок-метрики использования ИИ;
- **заметки**: каталог с поиском в шапке, scope `Глобальные/Локальные`, фильтр `Все / В контексте ИИ / Не в контексте`, AI-флаг, удаление, переход к посту из локальной заметки, кнопка `+ Новая глобальная` в правом крае строки фильтров (только в scope `Глобальные`);
- **чаты**: вкладки `Глобальные/Локальные`, поиск в шапке, переходы в чаты/к посту;
- **аналитика канала**: статичные периоды/карточки/таблица лучших постов.

## Сценарии демо

Сценарный слой `lib/replies.ts` отвечает за заскриптованные реплики ИИ:

- `getGlobalReply(text)` — реакции глобального ИИ на ключевые слова (`контент-план`, `рубрик`, `тем`, `охват`).
- `getPostReply(text)` — реакции локального ИИ (`перепиш`/`rewrite`, `заголов`, `почему`/`аналити`).

Если ввод не совпадает с подсказкой, ИИ отдаёт нейтральную заглушку (см. [`concept/12-demo.md`](../concept/12-demo.md), раздел «Сценарии как подсказки в полях ввода»).
