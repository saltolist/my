# TG Platform (Next.js + TypeScript)

**Production frontend** платформы TG Platform. См. [PRODUCT.md](./PRODUCT.md).

## Запуск локально

```bash
cd Docs_TG_Platform/web
npm install
npm run dev
# http://localhost:3000
```

## Сборка

```bash
npm run build
# out/
```

Деплой в подкаталог GitHub Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo>/Docs_TG_Platform/web npm run build
```

## Маршруты (URL)

| URL | Экран |
|-----|--------|
| `/` | Главная |
| `/feed/` | Лента |
| `/chats/` | Чаты |
| `/notes/` | Заметки |
| `/analytics/` | Аналитика |
| `/profile/` | Профиль |
| `/gchat/?id=…` | Глобальный чат |
| `/post/[id]/` | Пост |
| `/note/global/[id]/` | Глобальная заметка |
| `/note/post/[postId]/[noteId]/` | Заметка поста |
| `/note/new/` | Новая заметка |

`scripts/copy-404.mjs` — SPA fallback для GitHub Pages.

## Структура

```
web/
├── src/
│   ├── app/           # Next.js routes, store, styles
│   ├── screens/       # экраны (FSD layer)
│   ├── widgets/       # sidebar, composer, post-workspace, …
│   ├── features/      # сценарии (context menu, schedule, …)
│   ├── entities/      # post, message, …
│   └── shared/        # ui, lib, types, seed data
├── scripts/
├── ARCHITECTURE.md
├── PRODUCT.md
└── package.json
```

Подробная карта слоёв — [ARCHITECTURE.md](./ARCHITECTURE.md).

## Модель данных

Глобальное состояние — React Context + reducers в `src/app/model/store/`:

- **domain** — posts, chats, notes, profile configs (инициализация из `src/shared/data/seed-data.ts`)
- **navigation** — экран, текущий пост/чат/заметка, режимы post/note
- **composer** — отправка сообщений, выбор моделей
- **ui** — тема, ширина карточек ленты, dirty-флаги

Перезагрузка вкладки сбрасывает состояние к seed — до подключения backend.

## Фаза разработки (local-first)

Пока нет production API:

- ответы ИИ — `shared/lib/replies.ts` и stub в `chatPaths.ts`
- аналитика канала — seed-метрики
- Telegram-форма — UI без реального MTProto

Это **временное** поведение клиента, не позиционирование продукта.

## Документация

- [PRODUCT.md](./PRODUCT.md) — что такое продукт и терминология
- [ARCHITECTURE.md](./ARCHITECTURE.md) — FSD, aliases, правила импортов
- [`../concept/12-web-client.md`](../concept/12-web-client.md) — web-клиент, local-first фаза, ограничения
- [`../concept/`](../concept/) — продуктовая спецификация
