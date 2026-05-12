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
│   ├── chat/
│   │   └── ChatMessage.tsx  ← одиночные и multi-response сообщения ИИ
│   ├── composer/
│   │   └── Composer.tsx     ← поле ввода + LLM/Web Search селекторы + attach-menu
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   └── DraftsSection.tsx ← drag-and-drop черновиков
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
│   ├── types.ts             ← TS-типы Post / Note / Chat / Config
│   ├── data.ts              ← мок-данные на старте
│   ├── replies.ts           ← заскриптованные ответы ИИ
│   ├── composer-config.ts   ← провайдеры/модели LLM и Web Search
│   └── helpers.ts
├── state/
│   └── AppContext.tsx       ← единый useReducer + actions через useApp()
├── next.config.ts
├── package.json
├── tsconfig.json
└── .gitignore
```

## Модель данных

Вся изменяемая модель платформы живёт в одном `useReducer` в `state/AppContext.tsx`:

- `posts`, `globalChats`, `globalNotes`, `aiProfileConfig`, `telegramProfileConfig`, `pinnedPostIds` — мок-сущности;
- `screen`, `currentPostId`, `currentGChatId`, `currentNote`, `postMode`, `noteMode`, и т. п. — UI-состояние;
- `composerTargets` — выбор LLM/Web Search модели на каждой точке отправки (`home`, `gchat`, `post`).

Состояние полностью in-memory: перезагрузка вкладки возвращает демо к начальному состоянию.

## Что работает в демо

- лента с тремя секциями: `Опубликованные`, `Отложенные`, `Черновики`;
- drag-and-drop черновиков (за ручку `⠿`, индикатор места вставки) — порядок сохраняется в `posts` до перезагрузки вкладки;
- пространство поста: чат с локальным ИИ, inline-редактирование текста поста, переключение на режим заметок;
- глобальный чат: создание нового чата с главной, продолжение существующего, удаление;
- composer: выбор LLM-модели, Web Search-модели, режим мультиответа (с переключателем вариантов в сообщениях ИИ);
- attach-меню: медиа из запиненных постов (в глобальных чатах) и медиа из текущего поста (в локальном чате), плюс файл с компьютера;
- профиль:
  - вкладка `Канал` — статичная (демо-профиль);
  - вкладка `Настройки` — редактируемые LLM/Web Search модели, системный промпт, Telegram MTProto-форма со сценарием подключения;
  - вкладка `Аналитика платформы` — мок-метрики использования ИИ;
- заметки: каталог, фильтры (`Все / В контексте ИИ / Не в контексте`), AI-флаг, удаление, переход к посту из локальной заметки;
- аналитика канала: статичные периоды/карточки/таблица лучших постов.

## Сценарии демо

Сценарный слой `lib/replies.ts` отвечает за заскриптованные реплики ИИ:

- `getGlobalReply(text)` — реакции глобального ИИ на ключевые слова (`контент-план`, `рубрик`, `тем`, `охват`).
- `getPostReply(text)` — реакции локального ИИ (`перепиш`/`rewrite`, `заголов`, `почему`/`аналити`).

Если ввод не совпадает с подсказкой, ИИ отдаёт нейтральную заглушку (см. [`concept/12-demo.md`](../concept/12-demo.md), раздел «Сценарии как подсказки в полях ввода»).
